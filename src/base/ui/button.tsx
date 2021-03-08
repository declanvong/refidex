import React from 'react';
import styles from './button.css';

export type ButtonProps = {
  children: string;
  onClick(): void;
}

export class Button extends React.Component<ButtonProps> {
  render() {
    const { children, onClick } = this.props;

    return (
      <button onClick={onClick} className={styles.button}>
        {children}
      </button>
    )
  }
}
