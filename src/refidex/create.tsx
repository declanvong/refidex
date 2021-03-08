import { observer } from 'mobx-react';
import { RefidexModel } from 'model/model';
import { RefidexParseError, Serializer } from 'model/serializer';
import React from 'react';
import { Refidex } from 'refidex/refidex';
import { RefidexStore } from 'refidex/refidex_presenter';

export function createRefidex(model: RefidexModel) {
  const store = new RefidexStore(model);

  const onOpen = (file: any) => {
    try {
      const model = Serializer.deserializeModel(file);
      store.setModel(model);
    } catch (e) {
      if (e instanceof RefidexParseError) {
        // TODO: error handling
      }
      throw e;
    }
  };

  return observer(() => (
    <Refidex store={store} onOpen={onOpen}/>
  ));
}
