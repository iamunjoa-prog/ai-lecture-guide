"use client";

// 디자인 컴포넌트 미리보기 (임시 페이지 — 프론트엔드 에이전트가 삭제 예정)
import { useState, type ReactNode } from "react";
import {
  AppShell,
  BottomCTA,
  Button,
  Chip,
  LectureCard,
  LoadingPlan,
  OptionCard,
  OptionGroup,
  ProgressBar,
  QuestionHeader,
  ResultHero,
  RoadmapStep,
  Tag,
  TopBar,
} from "@/components/ui";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-border py-8 first:border-t-0">
      <h2 className="mb-4 text-xs font-bold tracking-widest text-fg-subtle uppercase">{title}</h2>
      {children}
    </section>
  );
}

const LEVELS = [
  { id: "beginner", icon: "🌱", title: "거의 써본 적 없어요", desc: "AI가 뭔지부터 알고 싶어요" },
  { id: "user", icon: "💬", title: "챗GPT 정도는 써봤어요", desc: "가끔 질문하거나 글을 다듬어요" },
  { id: "practitioner", icon: "🛠️", title: "업무에 자주 활용해요", desc: "프롬프트를 짜고 여러 도구를 써요" },
  { id: "developer", icon: "🧑‍💻", title: "직접 만들어 봤어요", desc: "API나 코드로 AI를 붙여 봤어요", disabled: true },
];

const DOMAINS = [
  { id: "automation", icon: "⚙️", title: "업무 자동화" },
  { id: "marketing", icon: "📣", title: "마케팅·콘텐츠" },
  { id: "coding", icon: "💻", title: "코딩" },
];

export default function UiPreviewPage() {
  const [level, setLevel] = useState("user");
  const [domains, setDomains] = useState<string[]>(["marketing"]);
  const toggle = (id: string) =>
    setDomains((d) => (d.includes(id) ? d.filter((x) => x !== id) : [...d, id]));

  return (
    <AppShell>
      <header className="pt-8 pb-2">
        <p className="text-sm font-bold text-primary-soft-fg">AI 강의 길잡이</p>
        <h1 className="text-2xl font-bold">UI 컴포넌트 미리보기</h1>
        <p className="mt-1 text-sm text-fg-muted">시스템 설정(라이트/다크)에 따라 색이 바뀌어요.</p>
      </header>

      <Section title="TopBar · QuestionHeader · OptionCard · BottomCTA">
        <div className="relative h-[620px] overflow-y-auto rounded-xl border border-border bg-bg px-5 shadow-lg">
          <div className="flex min-h-full flex-col">
            <TopBar step={2} total={5} onBack={() => {}} />
            <QuestionHeader
              id="q-level"
              stepLabel="질문 2"
              title="AI를 얼마나 써보셨나요?"
              helper="가장 가까운 걸 하나 골라 주세요."
              className="pt-4"
            />
            <OptionGroup labelledBy="q-level">
              {LEVELS.map((o) => (
                <OptionCard
                  key={o.id}
                  icon={o.icon}
                  title={o.title}
                  description={o.desc}
                  selected={level === o.id}
                  disabled={o.disabled}
                  onClick={() => setLevel(o.id)}
                />
              ))}
            </OptionGroup>
            <BottomCTA label="다음" onClick={() => {}} disabled={!level} />
          </div>
        </div>
      </Section>

      <Section title="OptionCard (multi) · BottomCTA helper/secondary">
        <QuestionHeader
          id="q-domain"
          stepLabel="질문 3"
          title="어떤 분야에 AI를 쓰고 싶으세요?"
          helper="최대 3개까지 고를 수 있어요."
          className="pt-0"
        />
        <OptionGroup variant="multi" labelledBy="q-domain">
          {DOMAINS.map((o) => (
            <OptionCard
              key={o.id}
              variant="multi"
              icon={o.icon}
              title={o.title}
              selected={domains.includes(o.id)}
              onClick={() => toggle(o.id)}
            />
          ))}
        </OptionGroup>
        <div className="mt-4 rounded-xl border border-dashed border-border-strong px-5">
          <BottomCTA
            label="선택 완료"
            disabled
            helperText="하나 이상 골라 주세요"
            secondary={<Button variant="ghost" size="sm">건너뛰기</Button>}
            className="static bg-none"
          />
        </div>
      </Section>

      <Section title="ProgressBar">
        <div className="flex flex-col gap-3">
          <ProgressBar value={1} max={5} />
          <ProgressBar value={3} max={5} />
          <ProgressBar value={5} max={5} />
        </div>
      </Section>

      <Section title="Button">
        <div className="flex flex-col gap-3">
          <Button size="lg" fullWidth trailingIcon="→">진단 시작하기</Button>
          <div className="flex flex-wrap gap-2">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm">작게</Button>
            <Button size="md" variant="secondary">보통</Button>
            <Button disabled>비활성</Button>
            <Button href="/" variant="ghost" size="sm">링크</Button>
          </div>
        </div>
      </Section>

      <Section title="Chip / Tag">
        <div className="flex flex-wrap gap-2">
          <Chip>기본</Chip>
          <Chip tone="primary" icon="🌱">입문자</Chip>
          <Chip tone="accent" icon="🔥">인기</Chip>
          <Chip tone="success">한국어 자막</Chip>
          <Tag>⏱ 42분</Tag>
          <Tag tone="primary">한국어</Tag>
        </div>
      </Section>

      <Section title="LoadingPlan">
        <div className="rounded-xl border border-border bg-surface">
          <LoadingPlan className="py-12" />
        </div>
      </Section>

      <Section title="ResultHero">
        <ResultHero
          eyebrow="진단 완료"
          title="민지 님에게 꼭 맞는 3단계 플랜이 준비됐어요"
          description="지금 수준에서 시작해 차근차근 올라가 봐요."
          chips={[
            { icon: "💬", label: "챗GPT 사용자" },
            { icon: "📣", label: "마케팅·콘텐츠", tone: "accent" },
            { icon: "🎯", label: "업무 도구로 쓰기" },
            { icon: "🇰🇷", label: "한국어 선호", tone: "success" },
          ]}
        />
      </Section>

      <Section title="RoadmapStep + LectureCard">
        <ol>
          <RoadmapStep step={1} label="기초 다지기" description="AI가 어떻게 작동하는지 감 잡기">
            <LectureCard
              instructorName="안드레이 카파시"
              instructorTitle="OpenAI 공동창업자 · 전 테슬라 AI 총괄"
              reason="챗GPT를 써 보셨다면, 그 안에서 무슨 일이 일어나는지 이해하면 훨씬 잘 쓸 수 있어요."
              videoTitle="Intro to Large Language Models"
              durationMin={60}
              language="en"
              hasKoreanSubtitle
              takeaways={[
                "LLM이 문장을 만들어 내는 원리",
                "학습과 미세조정의 차이",
                "AI의 한계와 보안 위험 이해",
              ]}
              url="https://www.youtube.com/watch?v=zjkBMFhNj_g"
              thumbnailUrl="https://i.ytimg.com/vi/zjkBMFhNj_g/hqdefault.jpg"
            />
          </RoadmapStep>
          <RoadmapStep step={2} label="업무에 써먹기" description="매일 하는 일을 AI로 줄이기">
            <LectureCard
              instructorName="샘플 강사"
              instructorTitle="대학교 컴퓨터공학과 교수"
              reason="마케팅 문구와 보고서 초안을 빠르게 만드는 실전 예시가 많아요."
              videoTitle="실무자를 위한 프롬프트 설계 (샘플)"
              durationMin={95}
              language="ko"
              hasKoreanSubtitle={false}
              kind="playlist"
              takeaways={["역할·맥락·형식을 담은 프롬프트", "반복 작업 템플릿 만들기", "결과물 검토 체크리스트"]}
              url="https://www.youtube.com/"
            />
          </RoadmapStep>
          <RoadmapStep step={3} label="나만의 도구 만들기" isLast>
            <p className="text-sm text-fg-muted">세 번째 단계 내용이 여기에 들어가요.</p>
          </RoadmapStep>
        </ol>
      </Section>
      <div className="h-10" />
    </AppShell>
  );
}
