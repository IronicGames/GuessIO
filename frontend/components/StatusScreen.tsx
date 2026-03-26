import { Flex } from '@mantine/core';

interface Props {
  text?: string;
}
export default function StatusScreen({ text = 'Loading...' }: Props) {
  return (
    <Flex justify="center" align="center">
      <div>{text}</div>
    </Flex>
  );
}
