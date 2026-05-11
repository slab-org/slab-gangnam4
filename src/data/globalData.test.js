import { globalClosingTasks, guideMessages } from './globalData';

test('신규 체험권 안내 문구는 1시간 무료체험을 안내한다', () => {
  const trialGuide = guideMessages.find((message) => message.title === '신규 체험권 안내');

  expect(trialGuide.text).toContain('신규 1시간 체험권 발급 완료되었습니다');
  expect(trialGuide.text).not.toContain('신규 3시간 체험권');
});

test('마감 업무 리스트는 1시간 체험권 처리로 안내한다', () => {
  const taskText = globalClosingTasks.tasks
    .flatMap((task) => [task.title, ...task.details])
    .join('\n');

  expect(taskText).toContain('신규 1시간 체험권 처리');
  expect(taskText).not.toContain('신규 3시간 체험권 처리');
});
