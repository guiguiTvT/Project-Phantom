import type { QuizAnswer, QuizGroup } from './caseStore';

interface Question {
  prompt: string;
  options: readonly [string, string, string];
  answer: QuizAnswer;
  reason: string;
}

export const QUESTIONS: Record<QuizGroup, Question[]> = {
  A: [
    {
      prompt: '有人自称学院助理，知道你的专业和活动名称，发来页面让你确认资格。你先怎么做？',
      options: ['信息能对上，先填再问。', '让对方发工作证照片，照片一致就填。', '从已有学院公告或通讯录另找联系方式，确认是否有这项安排。'],
      answer: 2, reason: '专业、活动名和对方提供的图片不能构成独立核验。应当另找已有的可靠渠道。',
    },
    {
      prompt: '一项只需姓名、学号和场次的活动报名，要求读取通讯录和精确位置，且无法关闭。你会怎么处理？',
      options: ['先同意，完成后卸载就能撤回全部历史资料。', '暂停使用，通过官方渠道确认必要字段，找只收必要资料的入口。', '页面有隐私说明，权限范围一定合理。'],
      answer: 1, reason: '应先判断所需资料与任务的关系。卸载或撤权之后，已提交的资料仍需单独处理。',
    },
    {
      prompt: '同学转来的表单提交成功，但页首写着上学期，最新公告也换了入口。你怎样确认本届报名？',
      options: ['通过本届官方入口或负责人核对名单，再视情况补登记。', '看到提交成功就算进入本届名单。', '两个表单再多填几遍。'],
      answer: 0, reason: '页面能提交只说明旧系统收到记录，应确认当前流程有没有收到。',
    },
  ],
  B: [
    {
      prompt: '一个用老师头像的账号说要临时改社团材料提交方式，还附了一张通知截图。你怎么确认？',
      options: ['在同一个聊天窗口再问一次。', '用已有教师通讯录或原有官方群联系本人，核对账号与安排。', '请转发最多的同学一起投票判断。'],
      answer: 1, reason: '显示名、头像和转发数量都不能确认发言者身份。用独立渠道联系本人。',
    },
    {
      prompt: '一个只记录学习时长的工具，要先读取联系人和精确位置。你会怎么做？',
      options: ['先查权限是否必要。无法合理解释且无法关闭时，选权限更少的方式。', '界面精美说明权限合理。', '以后删掉账号，已上传的资料一定立即消失。'],
      answer: 0, reason: '根据任务需要判断权限，并区分停止新的访问和处理已经上传的资料。',
    },
    {
      prompt: '旧版材料提交页还会显示成功，最新通知已经更换提交位置。怎样确认材料有效？',
      options: ['保留旧页面成功截图就可以。', '网页没报错，新旧系统应当互通。', '根据最新通知联系负责人或查本届记录，确认材料进入当前流程。'],
      answer: 2, reason: '成功提示只对应当前打开的页面。最终需要核对本届流程的接收记录。',
    },
  ],
};

export function score(group: QuizGroup, answers: QuizAnswer[]): number {
  return QUESTIONS[group].filter((question, index) => question.answer === answers[index]).length;
}
