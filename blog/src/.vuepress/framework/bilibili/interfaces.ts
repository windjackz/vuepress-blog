import { CmdType } from "./MsgModel";

/**
 * 弹幕基本格式
 *
 * @interface danmuJson
 */
interface danmuJson {
    /** 关键字 */
    cmd: string;
    roomid?: number;
}
/**
 * 开始直播
 * {"cmd":"LIVE","roomid":66688,"_roomid":66688}
 *
 * @interface LIVE
 */
interface LIVE {
    cmd: CmdType.LIVE;
    roomid: number;
}

/**
 * 人气
 * {"cmd": "POPULAR", "popular": 82444}
 * @interface POPULAR
 * */
export interface POPULAR {
    cmd: CmdType.POPULAR;
    popular: number;
}

/**
 * 弹幕消息
 * {"cmd":"DANMU_MSG","info":[[0,1,25,16777215,1561207623,759452963,0,"f8027857",0,0,0],"今天放飞自我了吗",[10852054,"Sileafa",0,0,0,10000,1,""],[6,"湊阿夸","湊-阿库娅Official",14917277,5805790,""],[16,0,6406234,">50000"],["title-217-1","title-217-1"],0,0,null,{"ts":1561207623,"ct":"7F1CD824"}],"_roomid":21399689}
 *
 * @interface DANMU_MSG
 * @extends {danmuJson}
 */
interface DANMU_MSG {
    cmd: CmdType.DANMU_MSG;
    info: DANMU_MSG_Info;
}

export interface DANMU_MSG_Info
  extends Array<
    | number
    | string
    | null
    | DANMU_MSG_Info_Danmu
    | DANMU_MSG_Info_User
    | DANMU_MSG_Info_Medal
    | DANMU_MSG_Info_Rank
    | DANMU_MSG_Info_Other
  > {
  /** 弹幕信息 */
  0: DANMU_MSG_Info_Danmu;
  /** 弹幕内容 */
  1: string;
  /** 用户信息 */
  2: DANMU_MSG_Info_User;
  /** 用户徽章 */
  3: DANMU_MSG_Info_Medal;
  /** 用户排行 */
  4: DANMU_MSG_Info_Rank;
  /** teamid */
  5: number;
  /** 舰队等级 */
  6: number;
  7: number;
  8: null;
  9: DANMU_MSG_Info_Other;
  10: number;
  11: number;
  12: null;
  13: null;
  14: number;
}
interface DANMU_MSG_Info_Rank extends Array<number | string> {
    /** 用户等级 */
    0: number;
    1: number;
    2: number;
    /** 等级排名, 具体值为number */
    3: number | string;
}
interface DANMU_MSG_Info_User extends Array<number | string> {
    /** 用户uid */
    0: number;
    /** 用户名 */
    1: string;
    /** 是否为管理员 */
    2: 0 | 1;
    /** 是否为月费老爷 */
    3: 0 | 1;
    /** 是否为年费老爷 */
    4: 0 | 1;
    // 5000=非正式会员用户, 10000=正式用户
    5: 5000 | 10000;
    // 已绑定手机？
    6: 0 | 1;
    /** 用户名颜色, #32进制颜色代码 */
    7: string;
}
interface DANMU_MSG_Info_Danmu extends Array<number | string> {
    0: number;
    /** 模式 */
    1: number;
    /** 字号 */
    2: number;
    /** 颜色 */
    3: number;
    /** 发送时间 */
    4: number;
    /** rnd */
    5: number | string;
    6: number;
    /** uid crc32 */
    7: string;
    8: number;
    // 0=普通弹幕，2=抽奖弹幕
    9: number;
    10: number;
}

interface DANMU_MSG_Info_Medal extends Array<number | string> {
    /** 徽章等级 */
    0: number;
    /** 勋章名 */
    1: string;
    /** 主播名 */
    2: string;
    /** 直播间, 字符串的貌似是原始房间号 */
    3: number | string;
    4: number;
    /** 特殊样式 */
    5: 'union' | string;
}
interface DANMU_MSG_Info_Other {
    ts: number;
    ct: string;
}
/**
 * 系统消息, 广播
 * {"cmd":"SYS_MSG","msg":"亚军主播【赤瞳不是翅桶是赤瞳】开播啦，一起去围观！","msg_text":"亚军主播【赤瞳不是翅桶是赤瞳】开播啦，一起去围观！","url":"http://live.bilibili.com/5198","_roomid":23058}
 * {"cmd":"SYS_MSG","msg":"丨奕玉丨:?送给:?大吉叽叽叽:?一个小电视飞船，点击前往TA的房间去抽奖吧","msg_text":"丨奕玉丨:?送给:?大吉叽叽叽:?一个小电视飞船，点击前往TA的房间去抽奖吧","msg_common":"全区广播：<%丨奕玉丨%>送给<%大吉叽叽叽%>一个小电视飞船，点击前往TA的房间去抽奖吧","msg_self":"全区广播：<%丨奕玉丨%>送给<%大吉叽叽叽%>一个小电视飞船，快来抽奖吧","rep":1,"styleType":2,"url":"http://live.bilibili.com/286","roomid":286,"real_roomid":170908,"rnd":2113258721,"broadcast_type":1,"_roomid":23058}
 * {"cmd":"SYS_MSG","msg":"sumikakaka:?送给:?仅仅穿堂风啊:?1个摩天大楼，点击前往TA的房间去抽奖吧","msg_text":"sumikakaka:?送给:?仅仅穿堂风啊:?1个摩天大楼，点击前往TA的房间去抽奖吧","msg_common":"网游区广播: <%sumikakaka%>送给<%仅仅穿堂风啊%>1个摩天大楼，点击前往TA的房间去抽奖吧","msg_self":"网游区广播: <%sumikakaka%>送给<%仅仅穿堂风啊%>1个摩天大楼，快来抽奖吧","rep":1,"styleType":2,"url":"http://live.bilibili.com/7533559","roomid":7533559,"real_roomid":7533559,"rnd":7,"broadcast_type":0,"_roomid":4393968}
 *
 * @interface SYS_MSG
 * @extends {danmuJson}
 */
interface SYS_MSG extends danmuJson {
    /** 消息内容 */
    msg: string;
    /** 同msg */
    msg_text: string;
    /** 点击跳转的地址 */
    url: string;
}
/**
 * 礼物消息
 * {"cmd":"SEND_GIFT","data":{"giftName":"B坷垃","num":1,"uname":"Vilitarain","rcost":28963232,"uid":2081485,"top_list":[{"uid":3091444,"uname":"丶你真难听","face":"http://i1.hdslb.com/bfs/face/b1e39bae99efc6277b95993cd2a0d7c176b52ce2.jpg","rank":1,"score":1657600,"guard_level":3,"isSelf":0},{"uid":135813741,"uname":"EricOuO","face":"http://i2.hdslb.com/bfs/face/db8cf9a9506d2e3fe6dcb3d8f2eee4da6c0e3e2d.jpg","rank":2,"score":1606200,"guard_level":2,"isSelf":0},{"uid":10084110,"uname":"平凡无奇迷某人","face":"http://i2.hdslb.com/bfs/face/df316f596d7dcd8625de7028172027aa399323af.jpg","rank":3,"score":1333100,"guard_level":3,"isSelf":0}],"timestamp":1517306026,"giftId":3,"giftType":0,"action":"赠送","super":1,"price":9900,"rnd":"1517301823","newMedal":1,"newTitle":0,"medal":{"medalId":"397","medalName":"七某人","level":1},"title":"","beatId":"0","biz_source":"live","metadata":"","remain":0,"gold":100,"silver":77904,"eventScore":0,"eventNum":0,"smalltv_msg":[],"specialGift":null,"notice_msg":[],"capsule":{"normal":{"coin":68,"change":1,"progress":{"now":1100,"max":10000}},"colorful":{"coin":0,"change":0,"progress":{"now":0,"max":5000}}},"addFollow":0,"effect_block":0},"_roomid":50583}
 * {"cmd":"SEND_GIFT","data":{"giftName":"小星星","num":5,"uname":"从小就好看zz","face":"http://i0.hdslb.com/bfs/face/a3cfe2e8567e380ce20cccdf69199a99e7f88106.jpg","guard_level":0,"rcost":169962792,"uid":324559285,"top_list":[],"timestamp":1561220907,"giftId":30085,"giftType":3,"action":"赠送","super":0,"super_gift_num":0,"price":100,"rnd":"D5CA8380-193D-4536-BD2A-9766037A99FA","newMedal":0,"newTitle":0,"medal":[],"title":"","beatId":"","biz_source":"live","metadata":"","remain":0,"gold":0,"silver":0,"eventScore":0,"eventNum":0,"smalltv_msg":[],"specialGift":null,"notice_msg":[],"capsule":null,"addFollow":0,"effect_block":1,"coin_type":"silver","total_coin":500,"effect":0,"tag_image":"","user_count":0,"send_master":null},"_roomid":83264}
 *
 * @interface SEND_GIFT
 */
interface SEND_GIFT {
    cmd: CmdType.SEND_GIFT;
    data: SEND_GIFT_Data;
}
interface SEND_GIFT_Data {
    /** 道具文案 */
    giftName: string;
    /** 数量 */
    num: number;
    /** 用户名 */
    uname: string;
    /** 用户头像 */
    face: string;
    /** 舰队等级 */
    guard_level: number;
    /** 主播积分 */
    rcost: number;
    /** 用户uid */
    uid: number;
    /** 更新排行 */
    top_list: SEND_GIFT_Data_TopList[] | [];
    /** 用户提供的rnd, 正常为10位 */
    timestamp: number;
    /** 礼物id */
    giftId: number;
    /** 礼物类型(普通, 弹幕, 活动) */
    giftType: number;
    action: '投喂' | '赠送';
    /** 高能 */
    super: 0 | 1;
    super_gift_num: number;
    /** 价值 */
    price: number;
    rnd: string;
    /** 是否获取到新徽章 */
    newMedal: 0 | 1;
    /** 是否获取到新头衔 */
    newTitle: 0 | 1;
    /** 新徽章 */
    medal: SEND_GIFT_Data_Medal | [];
    /** 新头衔 */
    title: string;
    /** 节奏风暴内容id \d | u\d+ */
    beatId: 0 | '' | string;
    biz_source: 'live';
    metadata: string;
    /** 道具包裹剩余数量 */
    remain: number;
    /** 剩余金瓜子 */
    gold: number;
    /** 剩余银瓜子 */
    silver: number;
    /** 主播活动积分, 普通道具为0 */
    eventScore: number;
    eventNum: number;
    /** 小电视 */
    smalltv_msg: SYS_MSG[] | [];
    /** 特殊礼物 */
    specialGift: SPECIAL_GIFT_Data | null;
    /** SYS_GIFT */
    notice_msg: string[] | [];
    /** 扭蛋 */
    capsule: SEND_GIFT_Data_Capsule | null;
    /** 是否新关注 */
    addFollow: 0 | 1;
    /** 估计只有辣条才能是1 */
    effect_block: 0 | 1;
    coin_type: 'gold' | 'silver';
    total_coin: number;
    effect: number;
    tag_image: string;
    user_count: number;
    send_master: null;
    //
    // animation_frame_num: number;
    // bag_coin_type: number;
    // bag_gift: number;
    // bind_roomid: number;
    // bind_ruid: number;
    // broadcast: number;
    // broadcast_id: number;
    // bullet_head: string;
    // bullet_tail: string;
    // coin_type: 'gold' | 'silver';
    // combo_resources_id: number;
    // corner_background: string;
    // corner_mark: string;
    // count_map: number[];
    // desc: string;
    // draw: number;
    // draw_id: number;
    // effect: number;
    // frame_animation: string;
    // full_sc_horizontal: '';
    // full_sc_horizontal_svga: string;
    // full_sc_vertical: '';
    // full_sc_vertical_svga: string;
    // full_sc_web: string;
    // gif: string;
    // gift_type: number;
    // goods_id: number;
    // id: number;
    // img_basic: string;
    // img_dynamic: string;
    // limit_interval: number;
    // max_send_limit: number;
    // name: string;
    // /** 价值 */
    // price: number;
    // privilege_required: number;
    // rights: string;
    // rule: string;
    // stay_time: number;
    // type: number;
    // webp: string;
    // weight: number;
}
interface SEND_GIFT_Data_Capsule_Data {
    /** 数量 */
    coin: number;
    /** 数量发生变化 */
    change: number;
    progress: SEND_GIFT_Data_Capsule_Data_Progress;
}

interface SEND_GIFT_Data_Capsule_Data_Progress {
    /** 当前送出道具价值 */
    now: number;
    /** 需要的道具价值 */
    max: number;
}
  
  
interface SEND_GIFT_Data_Capsule {
    /** 普通扭蛋 */
    normal: SEND_GIFT_Data_Capsule_Data;
    /** 梦幻扭蛋 */
    colorful: SEND_GIFT_Data_Capsule_Data;
}
  

type SPECIAL_GIFT_Data_BeatStorm =
  | SPECIAL_GIFT_Data_BeatStorm_Start
  | SPECIAL_GIFT_Data_BeatStorm_End;
interface SPECIAL_GIFT_Data {
    /** 节奏风暴 */
    '39': SPECIAL_GIFT_Data_BeatStorm;
}

interface SPECIAL_GIFT_Data_BeatStorm_Start {
    /** 节奏风暴id */
    id: number;
    /** 节奏持续时间 */
    time: number;
    /** 是否已经参与 */
    hadJoin: 0 | 1;
    /** 节奏数量 */
    num: number;
    /** 节奏内容 */
    content: string;
    /** 节奏开始 */
    action: 'start';
    /** 节奏风暴图标地址 */
    storm_gif: string;
}
  
  
interface SPECIAL_GIFT_Data_BeatStorm_End {
    /** 节奏风暴id */
    id: number;
    /** 结束 */
    action: 'end';
}
  

interface SEND_GIFT_Data_TopList {
    /** 用户uid */
    uid: number;
    /** 用户名 */
    uname: string;
    /** 头像地址 */
    face: string;
    /** 排行 */
    rank: number;
    /** 投喂总数 */
    score: number;
    /** 舰队等级 */
    guard_level: number;
    /** 是否本人 */
    isSelf: 0 | 1;
}

interface SEND_GIFT_Data_Medal {
    /** 徽章id */
    medalId: string;
    /** 徽章名 */
    medalName: string;
    /** 徽章等级 */
    level: 1;
}

/**
 * 特殊礼物消息
 * {"cmd":"SPECIAL_GIFT","data":{"39":{"id":169666,"time":90,"hadJoin":0,"num":1,"content":"啦噜啦噜","action":"start","storm_gif":"http://static.hdslb.com/live-static/live-room/images/gift-section/mobilegift/2/jiezou.gif?2017011901"}},"_roomid":5096}
 * {"cmd":"SPECIAL_GIFT","data":{"39":{"action":"end","id":1209259849440}},"_roomid":4404024}
 *
 * @interface SPECIAL_GIFT
 */
interface SPECIAL_GIFT {
    cmd: CmdType.SPECIAL_GIFT;
    data: SPECIAL_GIFT_Data;
}

interface COMBO_SEND_Data {
    /** 送礼人UID */
    uid: number;
    /** 送礼人名称 */
    uname: string;
    /** 主播 */
    r_uname: string;
    /** 连击次数 */
    combo_num: number;
    /** 礼物名 */
    gift_name: string;
    /** 礼物ID */
    gift_id: number;
    /** 赠送, 投喂 */
    action: '赠送' | '投喂';
    /** 连击ID, 不清楚用途 */
    combo_id: string;
    send_master: null;
    batch_combo_id: string;
    is_show: number;
}
  
  
/**
 * 礼物连击
 * {"cmd":"COMBO_SEND","data":{"uid":20768080,"uname":"禾酉蕗萱","combo_num":5,"gift_name":"铃铛","gift_id":30135,"action":"赠送","combo_id":"gift:combo_id:20768080:218187245:30135:1561220902.2409","send_master":null},"_roomid":8712071}
 *
 * @interface COMBO_SEND
 */
interface COMBO_SEND {
    cmd: CmdType.COMBO_SEND;
    data: COMBO_SEND_Data;
}

/**
 * 礼物连击结束
 * {"cmd":"COMBO_END","data":{"uname":"即使雨过也无法掩盖","r_uname":"Milky_Vtuber","combo_num":99,"price":100,"gift_name":"铃铛","gift_id":30135,"start_time":1561207566,"end_time":1561207614,"guard_level":3,"send_master":null},"_roomid":21399689}
 *
 * @interface COMBO_END
 */
interface COMBO_END {
    cmd: CmdType.COMBO_END;
    /** 礼物连击结束 */
    data: COMBO_END_Data;
}
  
interface COMBO_END_Data {
    /** 送礼人 */
    uname: string;
    /** 主播 */
    r_uname: string;
    /** 连击次数 */
    combo_num: number;
    /** 礼物价值 */
    price: number;
    /** 礼物名 */
    gift_name: string;
    /** 礼物ID */
    gift_id: number;
    /** 开始时间 */
    start_time: number;
    /** 结束时间 */
    end_time: number;
    /** 舰队等级 */
    guard_level?: number;
    send_master: null;
}

/**
 * 房间通知
 * {"cmd":"NOTICE_MSG","full":{"head_icon":"","is_anim":1,"tail_icon":"","background":"#33ffffff","color":"#33ffffff","highlight":"#33ffffff","border":"#33ffffff","time":10},"half":{"head_icon":"","is_anim":0,"tail_icon":"","background":"#33ffffff","color":"#33ffffff","highlight":"#33ffffff","border":"#33ffffff","time":8},"roomid":"360972","real_roomid":"493","msg_common":"恭喜<%千里一醉醉醉醉醉醉%>获得大奖<%100x普通扭蛋币%>, 感谢<%丨四四丨%>的赠送","msg_self":"恭喜<%千里一醉醉醉醉醉醉%>获得大奖<%100x普通扭蛋币%>, 感谢<%丨四四丨%>的赠送","link_url":"http://live.bilibili.com/493","msg_type":4,"_roomid":360972}
 * {"cmd":"NOTICE_MSG","full":{"head_icon":"http://i0.hdslb.com/bfs/live/72337e86020b8d0874d817f15c48a610894b94ff.png","tail_icon":"http://i0.hdslb.com/bfs/live/822da481fdaba986d738db5d8fd469ffa95a8fa1.webp","head_icon_fa":"http://i0.hdslb.com/bfs/live/72337e86020b8d0874d817f15c48a610894b94ff.png","tail_icon_fa":"http://i0.hdslb.com/bfs/live/38cb2a9f1209b16c0f15162b0b553e3b28d9f16f.png","head_icon_fan":1,"tail_icon_fan":4,"background":"#FFB03CFF","color":"#FFFFFFFF","highlight":"#B25AC1FF","time":10},"half":{"head_icon":"","tail_icon":"","background":"","color":"","highlight":"","time":8},"side":{"head_icon":"http://i0.hdslb.com/bfs/live/31566d8cd5d468c30de8c148c5d06b3b345d8333.png","background":"#FFE9C8FF","color":"#EF903AFF","highlight":"#D54900FF","border":"#FFCFA4FF"},"roomid":102002,"real_roomid":102002,"msg_common":"<%cxr0819%>在本房间开通了舰长","msg_self":"<%cxr0819%>在本房间开通了舰长","link_url":"https://live.bilibili.com/102002?live_lottery_type=2&broadcast_type=0&from=28003&extra_jump_from=28003","msg_type":3,"shield_uid":-1,"_roomid":102002}
 *
 * @interface NOTICE_MSG
 */
interface NOTICE_MSG {
    cmd: CmdType.NOTICE_MSG;
    full: NOTICE_MSG_Full;
    half: NOTICE_MSG_Half;
    side: NOTICE_MSG_Side;
    roomid: number;
    real_roomid: number;
    msg_common: string;
    msg_self: string;
    link_url: string;
    msg_type: number;
    shield_uid: number;
}
interface NOTICE_MSG_Full {
    head_icon: string;
    tail_icon: string;
    head_icon_fa: string;
    tail_icon_fa: string;
    head_icon_fan: number;
    tail_icon_fan: number;
    background: string;
    color: string;
    highlight: string;
    time: number;
}
interface NOTICE_MSG_Half {
    head_icon: string;
    tail_icon: string;
    background: string;
    color: string;
    highlight: string;
    time: number;
}
interface NOTICE_MSG_Side {
    head_icon: string;
    background: string;
    color: string;
    highlight: string;
    border: string;
}
  
/**
 * 欢迎消息
 * {"cmd":"WELCOME","data":{"uid":111153087,"uname":"拂晓の涟漪","isadmin":0,"vip":1},"roomid":939654,"_roomid":939654}
 *
 * @interface WELCOME
 */
interface WELCOME {
    cmd: CmdType.WELCOME;
    data: WELCOME_Data;
}

interface WELCOME_Data {
    /** 用户uid */
    uid: number;
    /** 用户名 */
    uname: string;
    /** 是否为管理员 */
    is_admin: 0 | 1;
    /** 是否为老爷 */
    vip: 0 | 1;
    /** 年费姥爷？ */
    svip: 0 | 1;
}

/**
 * 欢迎消息-舰队
 * {"cmd":"WELCOME_GUARD","data":{"uid":18753702,"username":"青山又依旧","guard_level":3},"_roomid":146088}
 *
 * @interface WELCOME_GUARD
 */
interface WELCOME_GUARD {
    cmd: CmdType.WELCOME_GUARD;
    data: WELCOME_GUARD_Data;
}
  
interface WELCOME_GUARD_Data {
    /** 用户uid */
    uid: number;
    /** 用户名 */
    username: string;
    /** 舰队等级 */
    guard_level: number;
}
  
/**
 * 舰队购买
 * {"cmd":"GUARD_BUY","data":{"uid":101961799,"username":"cxr0819","guard_level":3,"num":1,"price":198000,"gift_id":10003,"gift_name":"舰长","start_time":1561220913,"end_time":1561220913},"_roomid":102002}
 *
 * @interface GUARD_BUY
 */
export interface GUARD_BUY {
    cmd: CmdType.GUARD_BUY;
    data: GUARD_BUY_Data;
}
  
interface GUARD_BUY_Data {
    /** 用户uid */
    uid: number;
    /** 用户名 */
    username: string;
    /** 舰队等级 */
    guard_level: number;
    /** 购买数量 */
    num: number;
    price: number;
    gift_id: number;
    gift_name: string;
    start_time: number;
    end_time: number;
}

//  连接成功
export interface CONNECT_SUCCESS {
    cmd: CmdType.CONNECT_SUCCESS;
}

export interface SUPER_CHAT_MESSAGE_BASE {
    background_bottom_color: string;
    background_color: string;
    background_icon: string;
    background_image: string;
    background_price_color: string;
    end_time: number;
    font_color: string;
    id: number;
    message: string;
    message_trans: string;
    price: number;
    rate: number;
    start_time: number;
    time: number;
    token: string;
    trans_mark: number;
    ts: number;
    uid: number;
    user_info: SUPER_CHAT_MESSAGE_DATA_USER_INFO;
    face: string;
    face_frame: string;
    guard_level: number;
    is_main_vip: number;
    is_svip: number;
    is_vip: number;
    uname: string;
    user_level: number;
}

interface SUPER_CHAT_MESSAGE_DATA_USER_INFO {
    uname: string;
    face: string;
    face_frame: string;
    guard_level: number;
    user_level: number;
    level_color: string;
    is_vip: number;
    is_svip: number;
    is_main_vip: number;
    title: string;
    manager: number;
}
  
interface SUPER_CHAT_MESSAGE_DATA_MEDAL_INFO {
    icon_id: number;
    target_id: number;
    special: string;
    anchor_uname: string;
    anchor_roomid: number;
    medal_level: number;
    medal_name: string;
    medal_color: string;
    user_info: SUPER_CHAT_MESSAGE_DATA_USER_INFO;
}
  
interface SUPER_CHAT_MESSAGE_DATA_GIFT {
    num: number;
    gift_id: number;
    gift_name: string;
}
  

interface SUPER_CHAT_MESSAGE_DATA extends SUPER_CHAT_MESSAGE_BASE {
    medal_info: SUPER_CHAT_MESSAGE_DATA_MEDAL_INFO;
    gift: SUPER_CHAT_MESSAGE_DATA_GIFT;
}
  

/**
 * sc
 * {"cmd":"SUPER_CHAT_MESSAGE","data":{"id":"279277","uid":4613957,"price":30,"rate":1000,"message":"酸了，我也想让echo一个一个字念名字","trans_mark":0,"is_ranked":1,"message_trans":"","background_image":"http://i0.hdslb.com/bfs/live/1aee2d5e9e8f03eed462a7b4bbfd0a7128bbc8b1.png","background_color":"#EDF5FF","background_icon":"","background_price_color":"#7497CD","background_bottom_color":"#2A60B2","ts":1588838695,"token":"3957F115","medal_info":{"icon_id":0,"target_id":456368455,"special":"","anchor_uname":"黑桃影","anchor_roomid":21641569,"medal_level":11,"medal_name":"盗影团","medal_color":"#a068f1"},"user_info":{"uname":"缚鹿入炉忽鹿乳濡芦","face":"http://i2.hdslb.com/bfs/face/d88aed0b09fb2842c6bab81a62d989d0d5f19c70.jpg","face_frame":"","guard_level":0,"user_level":14,"level_color":"#61c05a","is_vip":1,"is_svip":0,"is_main_vip":0,"title":"0","manager":0},"time":59,"start_time":1588838694,"end_time":1588838754,"gift":{"num":1,"gift_id":12000,"gift_name":"醒目留言"}}}
 *
 * @interface SUPER_CHAT_MESSAGE
 */
export interface SUPER_CHAT_MESSAGE {
    cmd: CmdType.SUPER_CHAT_MESSAGE;
    data: SUPER_CHAT_MESSAGE_DATA;
}

/**
 * 直播警告
 * {"cmd":"WARNING","msg":"违反直播着装规范，请立即调整","roomid":883802,"_roomid":883802}
 * {"cmd":"WARNING","msg":"因版权原因，请立即更换","roomid":10727567,"_roomid":10727567}
 *
 * @interface WARNING
 */
interface WARNING {
    msg: string;
}
  
/**
 * 直播强制切断
 * {"cmd":"CUT_OFF","msg":"违反直播规范","roomid":945626,"_roomid":945626}
 *
 * @interface CUT_OFF
 * @extends {danmuJson}
 */
interface CUT_OFF extends danmuJson {
    /** 切断原因 */
    msg: string;
}

export type ConfigStateType = {
    // 客户端版本号
    version: string;
    // 最新版本
    latestVersion: string;
    // 语言
    languageCode: string;
    // 窗口置于顶层
    setAlwaysOnTop: 0 | 1;
    // 鼠标穿透
    ignoreMouse: 0 | 1;
    // 房间号
    roomid: number;
    // 房间短号
    shortid: number;
    // 显示头像
    showAvatar: number;
    // 头像大小
    avatarSize: number;
    // 显示粉丝头衔
    showFanLabel: 0 | 1;
    // 显示用户UL等级
    showLvLabel: 0 | 1;
    // 显示姥爷
    showVip: 0 | 1;
    // 背景颜色 0白色 1黑色
    backgroundColor: 0 | 1;
    // 背景透明度
    backgroundOpacity: number;
    // 弹幕文字字体
    fontFamily: string;
    // 弹幕文字字号缩放
    fontSize: number;
    // 弹幕文字行高
    fontLineHeight: number;
    // 弹幕文字上边距
    fontMarginTop: number;
    // 固定滚动
    blockScrollBar: 0 | 1;
    // 开启语音播放
    showVoice: 0 | 1;
    // 语音音量
    voiceVolume: number;
    // 语音播放速度
    voiceSpeed: number;
    // 是否自动翻译
    autoTranslate: 0 | 1;
    // 翻译输入语言： (auto)自动检测有时候不准确，所以建议设置指定翻译语言
    translateFrom: string;
    // 翻译输出语言
    translateTo: string;
    // 最大消息显示数量
    maxMessageCount: number;
    // 语音队列任务最大值
    taskMaxLength: number;
    // 朗读语言
    voiceTranslateTo: string;
    // 开启全局屏蔽
    blockMode: 0 | 1;
    // 屏蔽礼物弹幕[0,1]
    blockEffectItem0: 0 | 1;
    // 屏蔽抽奖弹幕[0,1]
    blockEffectItem1: 0 | 1;
    // 屏蔽进场信息[0,1](包括进入房间，关注了直播间)
    blockEffectItem2: 0 | 1;
    // 屏蔽醒目留言[0,1]
    blockEffectItem3: 0 | 1;
    // 屏蔽冒泡礼物[0,1]
    blockEffectItem4: 0 | 1;
    // 屏蔽舰长弹幕特效
    blockEffectItem5: 0 | 1;
    // 屏蔽表情动画
    blockEffectItem6: 0 | 1;
    // 显示最低金瓜子
    blockMinGoldSeed: number;
    // 显示最低银瓜子
    blockMinSilverSeed: number;
    // 屏蔽弹幕列表
    blockDanmakuLists: string[];
    // 屏蔽用户列表
    blockUserLists: number[];
    // 屏蔽用户等级[0,60]
    blockUserLv: number;
    // 屏蔽非正式会员
    blockUserNotMember: 0 | 1;
    // 屏蔽非绑定手机用户
    blockUserNotBindPhone: 0 | 1;
    // 自动翻译弹幕
    showTransition: 0 | 1;
    // 显示礼物弹幕列表
    showGiftDanmakuList: 0 | 1;
    // 礼物弹幕最大数量
    maxDanmakuGiftCount: number;
    // 礼物弹幕列表高度
    danmakuGiftListHeight: number;
};
  
  
  
  
export type DanmakuData =
  | LIVE
  | POPULAR
  | DANMU_MSG
  | SEND_GIFT
  | SPECIAL_GIFT
  | COMBO_SEND
  | COMBO_END
  | NOTICE_MSG
  | WELCOME
  | WELCOME_GUARD
  | GUARD_BUY
  | CONNECT_SUCCESS
  | SUPER_CHAT_MESSAGE
  | WARNING
  | CUT_OFF;
  

  /////  danmakuFormatted.d

  interface Connecting {
    cmd: string;
  }
  
  export interface DanmakuMsg {
    cmd: string;
    username: string;
    userID: number;
    isAdmin: boolean;
    isVip: boolean;
    isVipM: boolean;
    isVipY: boolean;
    guardLevel: number;
    userLevel: number;
    face?: string;
    fanLv: number;
    fanName: string;
    liveUp: string;
    liveRoomID: number | string;
    content: string;
    repeat: number;
  }

  interface DanmakuGift {
    cmd: string;
    username: string;
    userID: number;
    face: string;
    giftName: string;
    giftCount: number;
    giftAction: '赠送' | '投喂';
    coinType: 'gold' | 'silver';
    totalCoin: number;
    price: number;
    giftId: number;
    batchComboId?: string;
    superGiftNum?: number;
    superBatchGiftNum?: number;
  }
  
  interface GiftSend {
    cmd: string;
    username: string;
    userID: number;
    comboNum: number;
    giftName: string;
    giftId: number;
    action: '赠送' | '投喂';
    comboId: string;
    batchComboId: string;
    comboStayTime: number;
  }

export type GiftBubbleMsg = Partial<DanmakuGift & GiftSend>;

export interface UnknownMsg {
  cmd: string;
  content: string;
}

export interface GuardBuyMsg {
    cmd: string;
    username: string;
    userID: number;
    guardLevel: number;
    giftName: string;
    giftCount: number;
  }
  
export interface MsgWelcomeGuard {
    cmd: string;
    username: string;
    userID: number;
    guardLevel: number;
  }
  
export interface MsgWelcome {
    cmd: string;
    username: string;
    userID: number;
    isAdmin: boolean;
    isVip: boolean;
    isVipM: boolean;
    isVipY: boolean;
  }

  export interface MsgInterActWordMsg {
    cmd: string;
    msgType: number;
    username: string;
    userID: number;
  }
  
 export interface MsgRoomBlockMsg {
    cmd: string;
    username: string;
    userID: number;
  }
  
export interface WarningMsg {
    cmd: string;
    msg: string;
  }
  
export interface CutOffMsg {
    cmd: string;
    msg: string;
  }

  export  type DanmakuDataFormatted =
  | Connecting
  | DanmakuMsg
  | POPULAR
  | GiftBubbleMsg
  | GuardBuyMsg
  | MsgWelcomeGuard
  | MsgWelcome
  | MsgInterActWordMsg
  | MsgRoomBlockMsg
  | WarningMsg
  | CutOffMsg
  | UnknownMsg;