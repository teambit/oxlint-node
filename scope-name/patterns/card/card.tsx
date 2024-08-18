import type { ReactNode } from 'react';
import { Heading } from '@bitdesign/basic-react.typography.heading';
import { Text } from '@bitdesign/basic-react.typography.text';
import classNames from 'classnames';
import styles from './card.module.scss';

export type CardProps = {
  /**
   * content to include in the card.
   */
  children?: ReactNode;
  
  /**
   * content to use for heading.
   */
  title?: string;

  /**
   * class name to inject.
   */
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>;

/**
 * A simple card component.
 */
export function Card({ children, className, title, content, ...rest }: CardProps) {
  return (
    <div {...rest} className={classNames(styles.card, className)}>
      <Heading>
        {title}
      </Heading>
      <Text className={styles.customTextStyles}>{children}</Text>
    </div>
  );
}
