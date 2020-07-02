import { observer } from 'mobx-react';
import { RefidexModel } from 'model/model';
import React from 'react';
import { Refidex } from 'refidex/refidex';
import { RefidexPresenter, RefidexStore } from 'refidex/refidex_presenter';

export function createRefidex(model: RefidexModel) {
  const store = new RefidexStore(model);
  const presenter = new RefidexPresenter();

  return observer(() => (
    <Refidex store={store}/>
  ));
}
