use tiny_http::{Response, Server};

mod routes;
mod sensor;

/// Create a new server
pub fn init(ip: &str, port: u32) -> tiny_http::Server {
    let address: String = format!("{}:{}", ip, port);
    Server::http(address).unwrap()
}

/// Start a webServer
pub fn start(server: tiny_http::Server) {
    for request in server.incoming_requests() {
        let res: [String; 2];

        routes::all(&request);
        match request.url() {
            "/temp" => res = routes::get_temp(&request),
            _ => res = routes::not_found(&request),
        }

        let response =
            Response::from_string(&res[0]).with_header((&res[1]).parse::<tiny_http::Header>().unwrap());
        let _ = request.respond(response);
    }
}

#[cfg(test)]
mod tests {
    use super::super::common;
    use super::*;
    #[test]
    fn test_server_start() {
        assert_eq!(common::get_type(&init("127.0.0.1", 8080)), "tiny_http::Server");
    }
}