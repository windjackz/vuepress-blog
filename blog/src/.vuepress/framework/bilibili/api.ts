export interface UserInfo {
  face: string;
  level: number;
  mid: number;
  name: string;
}
  
export interface LiveRoom {
  roomid: number;
  shortid: number;
  uid: number;
  uname: string;
  face: string;
  title: string;
  isLive: boolean;
}
  
export interface LiveRoomInfoResponse {
  data?: {
    // 主播信息
    anchor_info: {
      base_info: {
        face: string;
        uname: string;
      };
    };
    // 直播间信息
    room_info: {
      uid: number;
      room_id: number;
      live_status: 0 | 1;
      short_id: 0 | number;
      title: string;
    };
  };
  message: string;
}

// 设置最大请求数5个，每次请求下一个间隔时间为200ms
export const apiTaskConfig = {
    taskMaxLength: 5,
    sleepMs: 200,
};

// 获取用户信息
export async function getUserInfo(mid: number): Promise<UserInfo> {
  const defaultUserInfo: UserInfo = {
    face: 'https://static.hdslb.com/images/member/noface.gif',
    level: 0,
    mid,
    name: ''
  };

  return new Promise<UserInfo>((resolve, reject) => {
    // 被ban后不再请求api
    if (config.showAvatar === 0) {
      resolve(defaultUserInfo);
      return;
    }
    fetch(`${API_USER_INFO}?mid=${mid}`)
      .then(res => {
        // 如果检测到被ban后自动关闭显示头像功能
        if (res.status === 412) {
          console.warn('显示头像功能已关闭, 请稍后再试...');
          config.showAvatar = 0;
          return resolve(defaultUserInfo);
        }
        return res.json();
      })
      .then(res => {
        // 保存avatar
        UserAvatarDao.save(mid, res.data.face);
        resolve(res.data);
      })
      .catch(e => {
        console.log(e);
        resolve(defaultUserInfo);
      });
  });
}

type Task = {
  uid: number;
};
const taskQueue: Task[] = [];
let isWorking = false;

async function handleTaskQueue() {
  isWorking = true;
  const task = taskQueue.shift();
  if (task) {
    await getUserInfo(task.uid);
    await handleTaskQueue();
  } else {
    isWorking = false;
  }
}

// 用户信息任务
const UserInfoApiTask = {
  push(uid: number) {
    if (taskQueue.length > apiTaskConfig.taskMaxLength) return;
    if (taskQueue.some(t => t.uid === uid)) return;
    taskQueue.push({ uid });
    if (!isWorking) {
      handleTaskQueue();
    }
  },
  getTaskQueueLength(): number {
    return taskQueue.length;
  }
};

export default UserInfoApiTask;