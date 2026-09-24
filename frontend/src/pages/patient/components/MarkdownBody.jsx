import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import styles from '../patient.module.css';

export default function MarkdownBody({ content }) {
  return (
    <div className={styles.mdBody}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: (props) => <h2 className={styles.mdH2} {...props} />,
          h2: (props) => <h2 className={styles.mdH2} {...props} />,
          h3: (props) => <h4 className={styles.mdH3} {...props} />,
          h4: (props) => <h4 className={styles.mdH3} {...props} />,
          p: (props) => <p className={styles.mdP} {...props} />,
          ul: (props) => <ul className={styles.mdUl} {...props} />,
          ol: (props) => <ol className={styles.mdOl} {...props} />,
          li: (props) => <li className={styles.mdLi} {...props} />,
          strong: (props) => <strong className={styles.mdStrong} {...props} />,
          table: (props) => (
            <div className={styles.mdTableWrap}>
              <table className={styles.mdTable} {...props} />
            </div>
          ),
          th: (props) => <th className={styles.mdTh} {...props} />,
          td: (props) => <td className={styles.mdTd} {...props} />,
          blockquote: (props) => <blockquote className={styles.mdQuote} {...props} />,
          hr: () => <hr className={styles.mdHr} />,
          em: (props) => <em className={styles.mdEm} {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}