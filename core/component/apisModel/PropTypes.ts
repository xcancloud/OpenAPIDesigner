export interface Props {
    dataSource: {
        deprecated?: boolean;
        operationId?: string;
        parameters?: Array<any>;
        tags?: string[];
        responses?: Record<string, Record<string, any>>;
        method?: string;
        endpoint?: string;
        summary: string;
        description: string;
        security?: {[key: string]: string[]}[];
        requestBody?: {
          [key: string]: any
        }
    };
    id: string;
    openapiDoc: {[key: string]: any};
}

export const httpStatus = [
  {"value": "100", "message": "Continue"},
  {"value": "101", "message": "Switching Protocols"},
  {"value": "102", "message": "Processing"},
  {"value": "103", "message": "Early Hints"},
  
  {"value": "200", "message": "OK"},
  {"value": "201", "message": "Created"},
  {"value": "202", "message": "Accepted"},
  {"value": "203", "message": "Non-Authoritative Information"},
  {"value": "204", "message": "No Content"},
  {"value": "205", "message": "Reset Content"},
  {"value": "206", "message": "Partial Content"},
  {"value": "207", "message": "Multi-Status"},
  {"value": "208", "message": "Already Reported"},
  {"value": "226", "message": "IM Used"},
  
  {"value": "300", "message": "Multiple Choices"},
  {"value": "301", "message": "Moved Permanently"},
  {"value": "302", "message": "Found"},
  {"value": "303", "message": "See Other"},
  {"value": "304", "message": "Not Modified"},
  {"value": "305", "message": "Use Proxy"},
  {"value": "307", "message": "Temporary Redirect"},
  {"value": "308", "message": "Permanent Redirect"},
  
  {"value": "400", "message": "Bad Request"},
  {"value": "401", "message": "Unauthorized"},
  {"value": "402", "message": "Payment Required"},
  {"value": "403", "message": "Forbidden"},
  {"value": "404", "message": "Not Found"},
  {"value": "405", "message": "Method Not Allowed"},
  {"value": "406", "message": "Not Acceptable"},
  {"value": "407", "message": "Proxy Authentication Required"},
  {"value": "408", "message": "Request Timeout"},
  {"value": "409", "message": "Conflict"},
  {"value": "410", "message": "Gone"},
  {"value": "411", "message": "Length Required"},
  {"value": "412", "message": "Precondition Failed"},
  {"value": "413", "message": "Payload Too Large"},
  {"value": "414", "message": "URI Too Long"},
  {"value": "415", "message": "Unsupported Media Type"},
  {"value": "416", "message": "Range Not Satisfiable"},
  {"value": "417", "message": "Expectation Failed"},
  {"value": "418", "message": "I'm a Teapot"},
  {"value": "422", "message": "Unprocessable Entity"},
  {"value": "423", "message": "Locked"},
  {"value": "424", "message": "Failed Dependency"},
  {"value": "425", "message": "Too Early"},
  {"value": "426", "message": "Upgrade Required"},
  {"value": "428", "message": "Precondition Required"},
  {"value": "429", "message": "Too Many Requests"},
  {"value": "431", "message": "Request Header Fields Too Large"},
  {"value": "451", "message": "Unavailable For Legal Reasons"},
  
  {"value": "500", "message": "Internal Server Error"},
  {"value": "501", "message": "Not Implemented"},
  {"value": "502", "message": "Bad Gateway"},
  {"value": "503", "message": "Service Unavailable"},
  {"value": "504", "message": "Gateway Timeout"},
  {"value": "505", "message": "HTTP Version Not Supported"},
  {"value": "506", "message": "Variant Also Negotiates"},
  {"value": "507", "message": "Insufficient Storage"},
  {"value": "508", "message": "Loop Detected"},
  {"value": "510", "message": "Not Extended"},
  {"value": "511", "message": "Network Authentication Required"}
];

  export const apiStatus = [
    {
      "value": "UNKNOWN",
      "label": "未知"
    },
    {
      "value": "IN_DESIGN",
      "label": "设计中"
    },
    {
      "value": "IN_DEV",
      "label": "开发中"
    },
    {
      "value": "DEV_COMPLETED",
      "label": "开发完成"
    },
    {
      "value": "RELEASED",
      "label": "已发布"
    }
  ]

  export const methodColor = {
    get: 'rgba(30, 136, 229, 1)',
    head: '#67D7FF',
    post: 'rgba(51, 183, 130, 1)',
    put: 'rgba(255, 167, 38, 1)',
    patch: 'rgba(171, 71, 188, 1)',
    delete: 'rgba(255, 82, 82, 1)',
    options: 'rgba(0, 150, 136, 1)',
    trace: '#7F91FF'
  }
