/*
  ============================================================
  内部安全验证 PoC（考试宝 / anki）
  仅限本公司产品的【授权】安全自测；仅用测试账号；禁止外传。
  目的：验证迁移后客户端响应仍可被篡改 → 推动服务端鉴权修复。
  运行环境：Quantumult X「重写」以 script-response-body 引用本文件
  ============================================================
*/
/*
[rewrite_local]
^https?:\/\/.*\/(user\/userInfo\/(get|getExtra|isJxtUser)|search\/(getOcrStatus|ocr2|mixPaper)|kaoShi\/.*|paper\/(home|topErrors|list)|user\/coupon\/getExpireInfo|mockExam\/config|document\/file|questions\/fetch) url script-response-body https://raw.githubusercontent.com/wangsvven/Loon/refs/heads/main/Scripts/ksb.js

[mitm]
hostname = ksbapi.jxedt.com, ge-api.jxedt.com, userapi.ksedt.com
*/
const url = $request.url;
const body = $response.body;

if (!body) {
    $done({});
}

function setBuyNumberToZero(obj) {
    if (typeof obj !== "object" || obj === null) return;
    for (let key in obj) {
        if (key === "buy_number") {
            obj[key] = "0";
        } else {
            setBuyNumberToZero(obj[key]);
        }
    }
}

try {
    let obj = JSON.parse(body);

    // —— 个人资料 / 用户信息（新路径 getExtra、isJxtUser，旧路径 get 兼容）——
    if ((url.includes("user/userInfo/get") || url.includes("user/userInfo/getExtra") || url.includes("user/userInfo/isJxtUser")) && obj.data) {
        obj.data.vip_type = "2";
        obj.data.vip_level = "2";
        obj.data.vip_expiration_time = "2099-09-09 09:09:09";
        obj.data.yst_vip_type = "2";
        obj.data.yst_vip_expiration_time = "2099-09-09 09:09:09";
        obj.data.expiration_time = "2099-09-09 09:09:09";
        obj.data.is_show_ad = "0";
        obj.data.status = "1";
        obj.data.user_type = "2";
        obj.data.auto_analysis_package = "99999";
        obj.data.remove_error_limit = "99999";
        obj.data.max_paper_limit = "99999";
        obj.data.export_system_paper_number = "99999";
        obj.data.kefu_import_paper_number = "99999";
        obj.data.smart_create_question = "99999";
        obj.data.system_error_recovery = "99999";
        obj.data.extra_exam_number = "99999";
        obj.data.show_paper_cover = "10000";

        if (!obj.data.feature_vips) {
            obj.data.feature_vips = [{
                "id": "1",
                "name": "尊贵高级VIP",
                "expiration_time": "2099-09-09 09:09:09"
            }];
        }

        if (obj.data.vip_config) {
            obj.data.vip_config.alert_title = "尊贵高级VIP";
            obj.data.vip_config.desc = "已解锁所有高级权益";
            for (let key in obj.data.vip_config) {
                if (key.indexOf("limit") !== -1) {
                    obj.data.vip_config[key] = "9999999";
                }
            }
        }
    }
    else if (url.includes("search/getOcrStatus")) {
        obj = { code: "200", data: { limit: "99999", photo_search_status: "1" }, time: String(Math.floor(Date.now() / 1000)) };
    }
    else if (url.includes("search/ocr2")) {
        obj = { code: "200", data: { text: "（OCR 验证占位）这是一道示例题目。", origin_text: "示例题目" }, time: String(Math.floor(Date.now() / 1000)), encrypt: "pfyH4fnEjUqitg7wTbQ5S7==" };
    }
    else if (url.includes("paper/topErrors")) {
        obj = { code: "200", data: { questions: {}, total: "0", page_count: "0" }, time: String(Math.floor(Date.now() / 1000)) };
    }
    else if (url.includes("user/coupon/getExpireInfo")) {
        obj = { code: "200", data: { has_coupon: "1", amount: "999", expired_at: "2099-09-09 09:09:09" }, time: String(Math.floor(Date.now() / 1000)) };
    }
    else if (url.includes("questions/fetch")) {
        if (obj.code === "404" && obj.msg && obj.msg.indexOf("付费题库") !== -1) {
            obj.msg = "顺序练习未解锁，直接用会员功能模拟考试";
        }
    }
    else if (url.includes("document/file")) {
        if (obj.data) {
            obj.data.sell_way = "0";
            obj.data.price = "0";
            obj.data.status = "8";
            obj.data.free_download_num = "999";
            obj.data.have_downed = "1";
            obj.data.is_buy = "1";
            if (obj.data.pages) {
                obj.data.preview_page = obj.data.pages;
            }
        }
    }
    else {
        if (obj.data) {
            if (obj.data.hasOwnProperty("sell_way")) obj.data.sell_way = "0";
            if (obj.data.hasOwnProperty("price")) obj.data.price = "0";
            if (obj.data.hasOwnProperty("have_downed")) obj.data.have_downed = "1";
            if (obj.data.hasOwnProperty("status")) obj.data.status = "8";
            if (obj.data.hasOwnProperty("free_download_num")) obj.data.free_download_num = "999";
            if (obj.data.hasOwnProperty("is_buy")) obj.data.is_buy = "1";
            if (obj.data.hasOwnProperty("is_expired")) obj.data.is_expired = "0";
            if (obj.data.hasOwnProperty("exercise_vip")) obj.data.exercise_vip = "1";
            if (obj.data.hasOwnProperty("expiration_time")) obj.data.expiration_time = "2099-09-09 09:09:09";
            if (obj.data.hasOwnProperty("need_password")) obj.data.need_password = "0";
            if (obj.data.paid_kaoshi_tip) obj.data.paid_kaoshi_tip = "已解锁";
            if (obj.data.paid_paper_tip) obj.data.paid_paper_tip = "已解锁";

            if (obj.data.kaoshi) {
                obj.data.kaoshi.status = "1";
                obj.data.kaoshi.price = "0";
                obj.data.kaoshi.is_buy = 1;
            }
            if (obj.data.paper) {
                obj.data.paper.price = "0";
                obj.data.paper.status = "1";
                obj.data.paper.show_ad = "0";
                obj.data.paper.enable_download = "1";
                obj.data.paper.is_vip_paper = "1";
                obj.data.paper.forbid_search = "0";
                obj.data.paper.preview_num = "99999";
            }
            if (obj.data.papers && Array.isArray(obj.data.papers)) {
                obj.data.papers.forEach(function (element) {
                    element.price = "0";
                    element.enable_download = "1";
                    element.is_vip_paper = "1";
                    element.sell_way = "0";
                    element.status = "8";
                });
            }
        }
    }

    setBuyNumberToZero(obj);
    $done({ body: JSON.stringify(obj) });
} catch (e) {
    $done({});
}
