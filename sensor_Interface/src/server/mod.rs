use super::logging;
use std::process;
use tiny_http::{Response, Server};

use super::sensor;
mod routes;

/// Create a new server
pub fn init(ip: &str, port: u32) -> tiny_http::Server {
    let address: String = format!("{}:{}", ip, port);
    Server::http(address).unwrap()
}

/// Start a webServer
pub fn start(
    server: tiny_http::Server,
    debug: bool,
    sensors: Vec<sensor::Sensor>,
    data_rate: i64,
    log_file: &String,
    event_log_cfg: &logging::LogCfg,
) {
    for request in server.incoming_requests() {
        let res: routes::Response;

        if debug && request.url() == "/EXIT" {
            res = routes::get_exit(&request);
            let _ = request.respond(Response::from_string(res.data));
            process::exit(0);
        }

        routes::all(&request, event_log_cfg);
        match &request.url().to_lowercase()[..] {
            "/temp" => res = routes::get_temp(&request, &sensors),
            "/test" => res = routes::get_test(&request),
            "/data/download" => res = routes::get_download(&request, log_file),
            "/data/stats" => res = routes::get_stats(&request, log_file, data_rate),
            _ => res = routes::not_found(&request),
        }

        let mut response = Response::from_string(res.data).with_status_code(res.status);

        for i in res.headers.iter() {
            response.add_header((i).parse::<tiny_http::Header>().unwrap());
        }

        let _ = request.respond(response);
    }
}

#[cfg(test)]
mod tests {
    use super::super::common;
    use super::*;
    #[test]
    fn test_server_init() {
        assert_eq!(
            common::get_type(&init("localhost", 8080)),
            "tiny_http::Server"
        );
    }
}
