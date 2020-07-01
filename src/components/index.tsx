import React from 'react';

export class Refidex extends React.Component<{ message: string }> {
  render() {
    return (
      <div>
        Hello world
        <br/>
        {this.props.message}
      </div>
    )
  }
}
