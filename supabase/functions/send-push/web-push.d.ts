declare module "npm:web-push@3.6.7" {
  type PushSubscription = {
    endpoint: string;
    keys: { p256dh: string; auth: string };
  };

  const webpush: {
    setVapidDetails(subject: string, publicKey: string, privateKey: string): void;
    sendNotification(subscription: PushSubscription, payload: string): Promise<void>;
  };

  export default webpush;
}
