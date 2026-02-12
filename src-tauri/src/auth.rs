use libsql::Database;
use serde::{Deserialize, Serialize};
use sha2::{Sha256, Digest};
use rand::Rng;
use jsonwebtoken::{encode, decode, Header, Validation, EncodingKey, DecodingKey, Algorithm};
use std::env;
use dotenvy::dotenv;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct User {
    pub id: Option<i64>,
    pub username: String,
    pub email: String,
    #[serde(skip_serializing)]
    #[allow(dead_code)]
    pub password_hash: Option<String>,
    #[serde(skip_serializing)]
    #[allow(dead_code)]
    pub salt: Option<String>,
    pub created_at: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct LoginCredentials {
    pub username: String,
    pub password: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct RegisterData {
    pub username: String,
    pub email: String,
    pub password: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AuthResponse {
    pub success: bool,
    pub message: String,
    pub user: Option<User>,
    pub token: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String,      // Subject (user_id)
    pub username: String, // Username
    pub exp: usize,       // Expiration time
    pub iat: usize,       // Issued at
}

// Generar salt aleatorio
fn generate_salt() -> String {
    let salt_bytes: Vec<u8> = (0..16).map(|_| rand::thread_rng().gen()).collect();
    hex::encode(salt_bytes)
}

// Hash password con salt
fn hash_password(password: &str, salt: &str) -> String {
    let mut hasher = Sha256::new();
    hasher.update(password.as_bytes());
    hasher.update(salt.as_bytes());
    hex::encode(hasher.finalize())
}


// Obtener la clave secreta JWT desde variable de entorno
fn get_jwt_secret() -> String {
    let _ = dotenv();
    env::var("JWT_SECRET").expect("JWT_SECRET no está definida en el entorno")
}

// Generar JWT token
fn generate_token(user_id: i64, username: &str) -> Result<String, jsonwebtoken::errors::Error> {
    let now = chrono::Utc::now().timestamp() as usize;
    let expiration = now + (24 * 60 * 60); // 24 horas

    let claims = Claims {
        sub: user_id.to_string(),
        username: username.to_string(),
        exp: expiration,
        iat: now,
    };

    let secret = get_jwt_secret();
    encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(secret.as_bytes()),
    )
}

// Verificar y decodificar JWT token
pub fn verify_token(token: &str) -> Result<Claims, jsonwebtoken::errors::Error> {
    let validation = Validation::new(Algorithm::HS256);
    let secret = get_jwt_secret();
    let token_data = decode::<Claims>(
        token,
        &DecodingKey::from_secret(secret.as_bytes()),
        &validation,
    )?;
    Ok(token_data.claims)
}

// Verificar token y retornar user_id - Helper para comandos protegidos
pub fn require_auth(token: &str) -> Result<i64, String> {
    match verify_token(token) {
        Ok(claims) => {
            claims.sub.parse::<i64>()
                .map_err(|_| "Token inválido: user_id no válido".to_string())
        }
        Err(_) => Err("Token inválido o expirado".to_string()),
    }
}

// Registrar usuario
pub async fn register_user(db: &Database, data: RegisterData) -> Result<AuthResponse, String> {
    let conn = db.connect().map_err(|e| e.to_string())?;
    
    // Validar que el usuario no exista
    let mut existing = conn.query(
        "SELECT id FROM users WHERE username = ?1 OR email = ?2",
        [libsql::Value::from(data.username.clone()), libsql::Value::from(data.email.clone())],
    ).await.map_err(|e| e.to_string())?;

    if let Some(_) = existing.next().await.map_err(|e| e.to_string())? {
        return Ok(AuthResponse {
            success: false,
            message: "Usuario o email ya existe".to_string(),
            user: None,
            token: None,
        });
    }

    // Generar salt y hash
    let salt = generate_salt();
    let password_hash = hash_password(&data.password, &salt);

    // Insertar usuario
    match conn.execute(
        "INSERT INTO users (username, email, password_hash, salt) VALUES (?1, ?2, ?3, ?4)",
        [libsql::Value::from(data.username.clone()), libsql::Value::from(data.email.clone()), libsql::Value::from(password_hash), libsql::Value::from(salt)],
    ).await {
        Ok(_) => {
            let user_id = conn.last_insert_rowid();
            
            match generate_token(user_id, &data.username) {
                Ok(token) => Ok(AuthResponse {
                    success: true,
                    message: "Usuario registrado exitosamente".to_string(),
                    user: Some(User {
                        id: Some(user_id),
                        username: data.username,
                        email: data.email,
                        password_hash: None,
                        salt: None,
                        created_at: Some(chrono::Utc::now().to_rfc3339()),
                    }),
                    token: Some(token),
                }),
                Err(e) => Ok(AuthResponse {
                    success: false,
                    message: format!("Error al generar token: {}", e),
                    user: None,
                    token: None,
                }),
            }
        }
        Err(e) => Ok(AuthResponse {
            success: false,
            message: format!("Error al registrar usuario: {}", e),
            user: None,
            token: None,
        }),
    }
}

// Login usuario
pub async fn login_user(db: &Database, credentials: LoginCredentials) -> Result<AuthResponse, String> {
    let conn = db.connect().map_err(|e| e.to_string())?;
    
    // Buscar usuario
    let mut result = conn.query(
        "SELECT id, username, email, password_hash, salt, CAST(created_at AS TEXT) AS created_at FROM users WHERE username = ?1",
        [libsql::Value::from(credentials.username.clone())],
    ).await.map_err(|e| e.to_string())?;

    match result.next().await.map_err(|e| e.to_string())? {
        Some(row) => {
            let user_id: i64 = row.get(0).map_err(|e| e.to_string())?;
            let username: String = row.get(1).map_err(|e| e.to_string())?;
            let email: String = row.get(2).map_err(|e| e.to_string())?;
            let stored_hash: String = row.get(3).map_err(|e| e.to_string())?;
            let salt: String = row.get(4).map_err(|e| e.to_string())?;
            let created_at: String = row.get(5).map_err(|e| e.to_string())?;
            
            // Verificar password
            let provided_hash = hash_password(&credentials.password, &salt);

            if provided_hash == stored_hash {
                match generate_token(user_id, &username) {
                    Ok(token) => Ok(AuthResponse {
                        success: true,
                        message: "Login exitoso".to_string(),
                        user: Some(User {
                            id: Some(user_id),
                            username: username.clone(),
                            email,
                            password_hash: None,
                            salt: None,
                            created_at: Some(created_at),
                        }),
                        token: Some(token),
                    }),
                    Err(e) => Ok(AuthResponse {
                        success: false,
                        message: format!("Error al generar token: {}", e),
                        user: None,
                        token: None,
                    }),
                }
            } else {
                Ok(AuthResponse {
                    success: false,
                    message: "Contraseña incorrecta".to_string(),
                    user: None,
                    token: None,
                })
            }
        }
        None => Ok(AuthResponse {
            success: false,
            message: "Usuario no encontrado".to_string(),
            user: None,
            token: None,
        }),
    }
}

// Obtener usuario por ID (para verificar token)
pub async fn get_user_by_id(db: &Database, user_id: i64) -> Result<User, String> {
    let conn = db.connect().map_err(|e| e.to_string())?;
    
    let mut result = conn.query(
        "SELECT id, username, email, CAST(created_at AS TEXT) AS created_at FROM users WHERE id = ?1",
        [libsql::Value::from(user_id)],
    ).await.map_err(|e| e.to_string())?;

    match result.next().await.map_err(|e| e.to_string())? {
        Some(row) => {
            Ok(User {
                id: Some(row.get(0).map_err(|e| e.to_string())?),
                username: row.get(1).map_err(|e| e.to_string())?,
                email: row.get(2).map_err(|e| e.to_string())?,
                password_hash: None,
                salt: None,
                created_at: Some(row.get(3).map_err(|e| e.to_string())?),
            })
        }
        None => Err("Usuario no encontrado".to_string()),
    }
}
