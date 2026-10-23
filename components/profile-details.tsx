import { TechIcon } from '@/components/tech-icons';
import styles from './profile-details.module.css';

export type EducationEntry = {
  title: string;
  description: string;
  period: string;
};

type ProfileDetailsProps = {
  education: readonly EducationEntry[];
  skills: readonly string[];
  exploring?: readonly string[];
};

function SchoolSeal({ school }: { school: string }) {
  if (school === '山东科技大学') {
    return <span className={styles.schoolSeal} aria-hidden="true"><img src="/images/education/sdust-logo.svg" width="48" height="48" alt="" loading="lazy" /></span>;
  }
  return <span className={styles.schoolFallback} aria-hidden="true"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m2 9 10-5 10 5-10 5L2 9ZM6 11v6c3.8 2.7 8.2 2.7 12 0v-6m4-2v7" /></svg></span>;
}

export function ProfileDetails({ education, skills, exploring = ['LangGraph', 'MCP', 'RAG'] }: ProfileDetailsProps) {
  if (!education.length && !skills.length) return null;

  return <div className={styles.profileDetails}>
    {education.length > 0 && <section className={styles.education} aria-labelledby="education-heading">
      <div className={styles.heading}><h2 id="education-heading">Education<span>.</span></h2></div>
      <ol className={styles.educationList}>
        {education.map((item) => <li className={styles.educationEntry} key={`${item.title}-${item.period}`}>
          <SchoolSeal school={item.title} />
          <div className={styles.educationCopy}>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
            <span className={styles.period}>{item.period}</span>
          </div>
        </li>)}
      </ol>
    </section>}

    {skills.length > 0 && <section className={styles.technologies} aria-labelledby="tech-stack-heading">
      <div className={styles.heading}><h2 id="tech-stack-heading">Tech Stack<span>.</span></h2></div>
      <ul className={styles.chips} aria-label="技术栈">
        {skills.map((skill) => <li className={styles.chip} key={skill}><TechIcon name={skill} /><span>{skill}</span></li>)}
      </ul>
      {exploring.length > 0 && <div className={styles.exploration}>
        <p className={styles.explorationLabel}><span className={styles.explorationDot} /> 正在探索<span className={styles.explorationDirection}>Agent 方向</span></p>
        <ul className={`${styles.chips} ${styles.exploringChips}`} aria-label="正在探索的 Agent 技术">
          {exploring.map((skill) => <li className={styles.chip} key={skill}><TechIcon name={skill} /><span>{skill}</span></li>)}
        </ul>
      </div>}
    </section>}
  </div>;
}
