use super::super::logging;
use super::super::*;
use super::sensor;

// I wish there was a nicer way to do this, but I can't figure it out.
// I now now know how to do it but I don't want to write it.

/// Define a response to a sensor request.
pub struct Response {
    pub status: u16,
    pub data: String,
    pub headers: Vec<String>,
}

/// Implementation for the Response type.
impl Response {
    /// Quick and easy way to create a response.
    pub fn new(status: u16, data: &str, headers: Vec<&str>) -> Response {
        let new_headers: Vec<String> = headers.iter().map(|header| header.to_string()).collect();
        Response {
            status,
            data: data.to_string(),
            headers: new_headers,
        }
    }
}

/// GET: "/*"
/// Run For All Requests
pub fn all(req: &tiny_http::Request, event_log_cfg: &logging::LogCfg) {
    logging::log_event(
        &event_log_cfg,
        common::color(
            &format!(
                "[+] {:?}: \"{}\" ({})",
                req.method(),
                req.url(),
                req.remote_addr()
            ),
            common::Color::Green,
        ),
    );
}

/// GET: "/EXIT"
/// When in Debug Mode this will exit the server
pub fn get_exit(_req: &tiny_http::Request) -> Response {
    // Goodbye World... So sad.
    Response::new(200, "Ok - Goodby World", vec!["Content-Type: text/plain"])
}

/// GET: "/temp"
/// Gives the current temperature and temperature history
pub fn get_temp(_req: &tiny_http::Request, sensors: &[sensor::Sensor]) -> Response {
    let all_temp: Vec<sensor::Value> = sensor::get_all_temp(sensors);
    let mut all_temp_json: String = "[[".to_string();

    for i in all_temp.iter() {
        all_temp_json.push_str(
            &format!(
                "{{\"id\": \"{}\", \"name\": \"{}\", \"temp\": {}}},",
                i.id, i.name, i.value
            )[..],
        );
    }
    all_temp_json = (&all_temp_json[1..all_temp_json.len() - 1]).to_string();

    Response::new(
        200,
        &format!(
            "{{\"temp\": {}, \"all\": {}]}}",
            all_temp[0].value, all_temp_json
        )[..],
        vec!["Content-Type: application/json"],
    )
}

/// Run on GET: "/data/download"
/// Download the current temperature history
pub fn get_download(_req: &tiny_http::Request, log_file: &str) -> Response {
    let history: Option<String> = sensor::get_history(log_file);
    if history.is_none() {
        return Response::new(
            200,
            "Data logging is not enabled :/",
            vec!["Content-Type: text/plain"],
        );
    }
    let format_history: String = history.unwrap().replace("\n\n", "\n");
    Response::new(
        200,
        &format!("time,temp\n{}", format_history)[..],
        vec!["Content-Type: text/csv"],
    )
}

/// Run on GET: "/data/stats"
/// Get statistics for the temperature history
///
/// Only for main sensor (For Now :P)
pub fn get_stats(_req: &tiny_http::Request, log_file: &str, rate: i64) -> Response {
    // Get all history from log file
    let history: Option<String> = sensor::get_history(log_file);

    // If there is no history, return an error
    if history.is_none() {
        return Response::new(
            200,
            "Data logging is not enabled :/",
            vec!["Content-Type: text/plain"],
        );
    };

    // Convert the history to a vector of lines
    let history = history.unwrap();
    let data: Vec<&str> = history.split('\n').collect();
    let first: Vec<&str> = data[0].split(',').collect();
    let last: Vec<&str> = data[data.len() - 2].split(',').collect();

    // Setup vars for min, max and avg
    let mut min = f64::MAX;
    let mut max = f64::MIN;
    let mut mean: f64 = 0.0;

    // Loop through all lines in the history
    for i in &data {
        // Split by ',' to get each value
        let items: Vec<&str> = i.split(',').collect();

        // Continue if there are less than 2 values
        if items.len() < 2 {
            continue;
        }

        // Loop through all values and add to max, min and total
        for i in items.iter().skip(1) {
            // Get temp as a f64
            let temp = match i.parse::<f64>() {
                Ok(i) => i,
                Err(_) => continue,
            };

            mean += temp;
            if temp > max {
                max = temp;
            }
            if temp < min {
                min = temp;
            }
        }
    }
    let json_response: &str = &format!(
        r#"{{"length":{}, "mean": {}, "first":{}, "last":{}, "rate":{}, "min":{}, "max":{}}}"#,
        data.len(),
        mean / data.len() as f64,
        first[0],
        last[0],
        60.0 / (rate as f64 / 1000.0 / 60.0),
        min,
        max
    );
    Response::new(200, json_response, vec!["Content-Type: application/json"])
}

/// Run on GET "/test"
/// Make sure everything is working :P
pub fn get_test(_req: &tiny_http::Request) -> Response {
    Response::new(
        200,
        &format!(
            "{{\"message\": \"All Systems are a Go!\", \"version\": \"{}\"}}",
            VERSION
        )[..],
        vec!["Content-Type: application/json"],
    )
}

/// GET: "/*" when no other route is found
/// Run when no specific route is defined
pub fn not_found(_req: &tiny_http::Request) -> Response {
    Response::new(
        404,
        "Error: Path Not Found :/",
        vec!["Content-Type: text/plain"],
    )
}
