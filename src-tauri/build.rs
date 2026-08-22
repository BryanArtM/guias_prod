use std::collections::HashMap;
use std::env;

const CLAVES_INCRUSTADAS: [&str; 3] = ["JWT_SECRET", "TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN"];

fn main() {
    println!("cargo:rerun-if-changed=.env");

    let desde_archivo: HashMap<String, String> = dotenvy::from_filename_iter(".env")
        .map(|iter| iter.flatten().collect())
        .unwrap_or_default();

    for clave in CLAVES_INCRUSTADAS {
        println!("cargo:rerun-if-env-changed={clave}");

        // La variable del entorno gana sobre el .env, para poder compilar una
        // release con credenciales distintas a las de desarrollo sin tocar el
        // archivo.
        let valor = env::var(clave)
            .ok()
            .or_else(|| desde_archivo.get(clave).cloned());

        if let Some(valor) = valor {
            println!("cargo:rustc-env={clave}={valor}");
        }
    }

    tauri_build::build()
}
