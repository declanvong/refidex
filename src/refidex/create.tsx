import { observer } from 'mobx-react';
import { RefidexModel } from 'model/model';
import React from 'react';
import { Refidex } from 'refidex/refidex';
import { RefidexStore } from 'refidex/refidex_presenter';

export function createRefidex(model: RefidexModel) {
  const store = new RefidexStore(model);

  return observer(() => (
    <Refidex store={store}/>
  ));
}
