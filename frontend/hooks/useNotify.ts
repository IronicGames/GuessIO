import { notifications } from '@mantine/notifications';

export function useNotify() {
  const error = (message: string, title: string = 'Something went wrong') => {
    notifications.show({
      color: 'red',
      title,
      message,
    });
  };

  const success = (message: string, title: string = 'Success') => {
    notifications.show({
      color: 'green',
      title,
      message,
    });
  };

  return { error, success };
}
