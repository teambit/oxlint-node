import { ReactNode } from 'react';
import classNames from 'classnames';
import styles from './button.module.scss';

export type ButtonProps = {
  /**
   * a node to be rendered in the in the button.
   */
  children?: ReactNode;

  /**
   * a class name to for custom styles.
   */
  className?: string;
} & React.HTMLAttributes<HTMLButtonElement>;

/**
 * a button component that uses design tokens
 * from the acme theme.
 */
export function Button({ className, children }: ButtonProps) {
  // use the `useTheme` hook to get access to design tokens in JS code.
  // using colors using design tokens, helps keep components implantation
  // agnostic to colors.

  return (
    <button
      type="button"
      // use classnames to allow consumers of the component to
      // override its styles in case it is required.
      className={classNames(styles.button, className)}
    >
      {children}
    </button>
  );
}
