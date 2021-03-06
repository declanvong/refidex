import { RefidexModel } from 'model/model';
import { Serializer } from 'model/serializer';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { createRefidex } from 'refidex/create';

(async () => {
  const _model = await (await fetch('model.json')).json();
  const model: RefidexModel = Serializer.deserializeModel(_model)
  const Graph = createRefidex(model);
  ReactDOM.render(<Graph/>, document.getElementById('app'));
})();
