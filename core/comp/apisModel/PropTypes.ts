export interface Props {
    dataSource: {
        deprecated: boolean;
        operationId: string;
        parameters?: Array<any>;
        tags?: string[];
        responses: Record<string, Record<string, any>>;
        method: string;
        endpoint: string;
        summary: string;
        description: string;
        security: {[key: string]: string[]}[];
        'x-xc-status': string;
    };
    id: string;
    openapiDoc: {[key: string]: any};
}

export const httpStatus = [
    {
      "value": "100",
      "message": "继续"
    },
    {
      "value": "101",
      "message": "协议切换"
    },
    {
      "value": "102",
      "message": "正在处理"
    },
    {
      "value": "103",
      "message": "检查点"
    },
    {
      "value": "200",
      "message": "成功"
    },
    {
      "value": "201",
      "message": "已创建"
    },
    {
      "value": "202",
      "message": "已接受"
    },
    {
      "value": "203",
      "message": "非权威性信息"
    },
    {
      "value": "204",
      "message": "无内容"
    },
    {
      "value": "205",
      "message": "重置内容"
    },
    {
      "value": "206",
      "message": "部分内容"
    },
    {
      "value": "207",
      "message": "多状态"
    },
    {
      "value": "208",
      "message": "已有报告"
    },
    {
      "value": "226",
      "message": "正在使用IM"
    },
    {
      "value": "300",
      "message": "多种选择"
    },
    {
      "value": "301",
      "message": "永久移动"
    },
    {
      "value": "302",
      "message": "已找到"
    },
    {
      "value": "302",
      "message": "暂时移动"
    },
    {
      "value": "303",
      "message": "见其他"
    },
    {
      "value": "304",
      "message": "未修改"
    },
    {
      "value": "305",
      "message": "使用代理"
    },
    {
      "value": "307",
      "message": "暂时重定向"
    },
    {
      "value": "308",
      "message": "永久重定向"
    },
    {
      "value": "400",
      "message": "请求出错"
    },
    {
      "value": "401",
      "message": "未授权"
    },
    {
      "value": "402",
      "message": "需要付款"
    },
    {
      "value": "403",
      "message": "禁止访问"
    },
    {
      "value": "404",
      "message": "未找到"
    },
    {
      "value": "405",
      "message": "不允许请求的方法"
    },
    {
      "value": "406",
      "message": "无法接受"
    },
    {
      "value": "407",
      "message": "需要代理身份验证"
    },
    {
      "value": "408",
      "message": "请求超时"
    },
    {
      "value": "409",
      "message": "冲突"
    },
    {
      "value": "410",
      "message": "已经不存在"
    },
    {
      "value": "411",
      "message": "需要长度标头"
    },
    {
      "value": "412",
      "message": "先决条件失败"
    },
    {
      "value": "413",
      "message": "有效负载过大"
    },
    {
      "value": "413",
      "message": "请求实体过大"
    },
    {
      "value": "414",
      "message": "URI 过长"
    },
    {
      "value": "414",
      "message": "请求 URI 过长"
    },
    {
      "value": "415",
      "message": "不支持的媒体类型"
    },
    {
      "value": "416",
      "message": "无法满足请求的范围"
    },
    {
      "value": "417",
      "message": "期望失败"
    },
    {
      "value": "418",
      "message": "非正式的HTTP状态码，通常用于测试或幽默的目的"
    },
    {
      "value": "419",
      "message": "资源空间不足"
    },
    {
      "value": "420",
      "message": "方法失败"
    },
    {
      "value": "421",
      "message": "目标被锁定"
    },
    {
      "value": "422",
      "message": "无法处理的实体"
    },
    {
      "value": "423",
      "message": "已锁定"
    },
    {
      "value": "424",
      "message": "依赖失败"
    },
    {
      "value": "425",
      "message": "过早"
    },
    {
      "value": "426",
      "message": "需要升级"
    },
    {
      "value": "428",
      "message": "需要先决条件"
    },
    {
      "value": "429",
      "message": "请求过多"
    },
    {
      "value": "431",
      "message": "请求标头字段过大"
    },
    {
      "value": "451",
      "message": "因法律原因不可用"
    },
    {
      "value": "500",
      "message": "服务器出错"
    },
    {
      "value": "501",
      "message": "功能未实现"
    },
    {
      "value": "502",
      "message": "错误的网关"
    },
    {
      "value": "503",
      "message": "服务不可用"
    },
    {
      "value": "504",
      "message": "网关超时"
    },
    {
      "value": "505",
      "message": "HTTP版本不支持"
    },
    {
      "value": "506",
      "message": "变体也会协商"
    },
    {
      "value": "507",
      "message": "存储空间不足"
    },
    {
      "value": "508",
      "message": "检测到循环"
    },
    {
      "value": "509",
      "message": "带宽超限"
    },
    {
      "value": "510",
      "message": "未扩展"
    },
    {
      "value": "511",
      "message": "需要网络身份验证"
    }
  ];

  export const apiStatus = [
    {
      "value": "UNKNOWN",
      "message": "未知"
    },
    {
      "value": "IN_DESIGN",
      "message": "设计中"
    },
    {
      "value": "IN_DEV",
      "message": "开发中"
    },
    {
      "value": "DEV_COMPLETED",
      "message": "开发完成"
    },
    {
      "value": "RELEASED",
      "message": "已发布"
    }
  ]
