import { Notification } from "electron";
import type { NotificationConstructorOptions } from "electron";

const showNotification = (title: string, body: string) => {
  const notice = {
    title,
    body,
  } as NotificationConstructorOptions;
  new Notification(notice).show();
};

export default showNotification;
