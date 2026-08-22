use dotenvy::dotenv;
use std::env;
use std::sync::OnceLock;

fn cargar_dotenv_una_vez() {
    static CARGADO: OnceLock<()> = OnceLock::new();
    CARGADO.get_or_init(|| {
        dotenv().ok();
    });
}

fn resolver(clave: &str, incrustado: Option<&'static str>) -> String {
    cargar_dotenv_una_vez();

    if let Ok(valor) = env::var(clave) {
        if !valor.is_empty() {
            return valor;
        }
    }

    match incrustado.filter(|valor| !valor.is_empty()) {
        Some(valor) => valor.to_string(),
        None => panic!(
            "{clave} no esta disponible: no se encontro en el entorno ni quedo \
             incrustada al compilar. Verifica que src-tauri/.env la defina."
        ),
    }
}

pub fn jwt_secret() -> String {
    resolver("JWT_SECRET", option_env!("JWT_SECRET"))
}

pub fn turso_database_url() -> String {
    resolver("TURSO_DATABASE_URL", option_env!("TURSO_DATABASE_URL"))
}

pub fn turso_auth_token() -> String {
    resolver("TURSO_AUTH_TOKEN", option_env!("TURSO_AUTH_TOKEN"))
}
