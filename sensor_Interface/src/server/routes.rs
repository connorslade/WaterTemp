use super::super::logging;
use super::super::*;
use super::sensor;

// I wish there was a nice way to do this, but I can't figure it out.

/// GET: "/*"
/// Run For All Requests
pub fn all(req: &tiny_http::Request, event_log_cfg: &logging::LogCfg) {
    logging::log_event(
        &event_log_cfg,
        format!(
            "{}",
            common::color(
                &format!("[+] {:?}: \"{}\"", req.method(), req.url())[..],
                32
            )
        ),
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
pub fn get_temp(
    _req: &tiny_http::Request,
    dev_id: &str,
    debug: bool,
    calibration: f64,
) -> [String; 2] {
    let temp: f64 = sensor::get_temperature(&dev_id, debug, Some(calibration));

    [
        format!("{{\"temp\": {}}}", temp),
        "Content-type: application/json".to_string(),
    ]
}

/// Run on GET: "/data/download"
/// Download the current temperature history
pub fn get_download(_req: &tiny_http::Request, log_file: &String) -> [String; 2] {
    let history: Option<String> = sensor::get_history(log_file);
    if history.is_none() {
        return [
            "Data logging is not enabled :/".to_string(),
            "Content-type: text/plain".to_string(),
        ];
    }
    let format_history: String = history.unwrap().replace("\n\n", "\n");
    [
        format!("time,temp\n{}", format_history),
        "Content-type: text/plain".to_string(),
    ]
}

/// Run on GET: "/data/stats"
/// Get statistics for the temperature history
pub fn get_stats(_req: &tiny_http::Request, log_file: &String, rate: i64) -> [String; 2] {
    let history: Option<String> = sensor::get_history(log_file);
    if history.is_none() {
        return [
            "Data logging is not enabled :/".to_string(),
            "Content-type: text/plain".to_string(),
        ];
    };
    let history = history.unwrap();
    let data: Vec<&str> = history.split('\n').collect();
    let first: Vec<&str> = data[0].split(',').collect();
    let last: Vec<&str> = data[data.len() - 2].split(',').collect();
    let mut min = f64::MAX;
    let mut max = 0.0;
    let mut mean: f64 = 0.0;
    for i in &data {
        let items: Vec<&str> = i.split(',').collect();
        if items.len() != 2 {
            continue;
        }
        let temp = items[1].parse::<f64>().unwrap();

        mean += temp;
        if temp > max {
            max = temp;
        }
        if temp < min {
            min = temp;
        }
    }
    [
        format!(
            "{{\"length\":{}, \"mean\": {}, \"first\":{}, \"last\":{}, \"rate\":{}, \"min\":{}, \"max\":{}}}",
            data.len(),
            mean / data.len() as f64,
            first[0],
            last[0],
            60.0 / (rate as f64 / 1000.0 / 60.0),
            min,
            max
        ),
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
