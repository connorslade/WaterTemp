use std::fs;

/// Config Struct
pub struct Config {
    pub file: String,
    data: Vec<[String; 2]>,
}

/// Some errors that can be thrown
pub enum ConfigError {
    FileReadError,
    InvalidFile,
}

/// Config Implementation
impl Config {

    /// Default Config
    /// ```rust
    /// let mut cfg = config::Config::new("config.ini");
    /// ```
    pub fn new(file: &str) -> Self {
        Config {
            file: file.to_string(),
            data: vec![],
        }
    }

    /// Reads the config file
    /// ```rust
    /// cfg.read().ok().unwrap();
    /// ```
    pub fn read(&mut self) -> Result<Vec<[String; 2]>, ConfigError> {
        let contents = match fs::read_to_string(&self.file) {
            Ok(contents) => contents,
            Err(_) => return Err(ConfigError::FileReadError),
        };
        let mut done: Vec<[String; 2]> = Vec::new();

        for line in contents.split('\n') {
            if line.starts_with("#") {
                continue;
            }
            let parts: Vec<&str> = line.split('=').collect();
            if parts.len() != 2 {
                return Err(ConfigError::InvalidFile);
            }
            let key = parts[0].replace(" ", "");
            let mut value = parts[1].to_string();
            
            while value.starts_with(" ") {
                value = value[1..value.len()].to_string();
            }
            
            done.push([key, value]);
        }
        self.data = done.clone();
        return Ok(done);
    }

    /// Gets a value from the config
    /// ```rust
    /// cfg.get("key")
    /// ```
    pub fn get(&self, key: &str) -> String {
        for i in self.data.iter() {
            if i[0] == key {
                return i[1].to_string();
            }
        }
        return "".to_string();
    }
}
