use super::super::*;
use super::sensor;

// I wish there was a nice way to do this, but I can't figure it out.

/// GET: "/*"
/// Run For All Requests
pub fn all(req: &tiny_http::Request) {
    println!(
        "{}",
        common::color(&format!("[+] {:?}: \"{}\"", req.method(), req.url())[..], 32)
    );
}

/// GET: "/EXIT"
/// When in Debug Mode this will exit the server
pub fn get_exit(_req: &tiny_http::Request) -> [String; 2] {
    [
        "Ok - Goodby World".to_string(),
        "Content-type: text/plain".to_string(),
    ]
}

/// GET: "/temp"
/// Gives the current temperature and temperature history
pub fn get_temp(_req: &tiny_http::Request, dev_id: &String, debug: bool) -> [String; 2] {
    let temp: f64 = sensor::get_temperature(&dev_id, debug);

    let mut history: String = "".to_owned();
    for i in 0..10 {
        if i == 9 {
            //history.push_str(&sensor::get_temperature(&dev_id, debug).to_string()[..]);
            history.push_str("0");
            continue;
        }
        //history.push_str(&format!("{}, ", sensor::get_temperature(&dev_id, debug))[..]);
        history.push_str("0, ");
    }

    [
        format!("{{\"temp\": {}, \"history\": [{}]}}", temp, history),
        "Content-type: application/json".to_string(),
    ]
}

/// Run on GET "/test"
/// Make sure everything is working :P
pub fn get_test(_req: &tiny_http::Request) -> [String; 2] {
    [
        format!(
            "{{\"message\": \"All Systems are a Go!\", \"version\": {}}}",
            VERSION
        ),
        "Content-type: application/json".to_string(),
    ]
}

/// GET: "/*" when no other route is found
/// Run when no specific route is defined
pub fn not_found(_req: &tiny_http::Request) -> [String; 2] {
    [
        "Error: Path Not Found :/".to_string(),
        "Content-type: text/plain".to_string(),
    ]
}
