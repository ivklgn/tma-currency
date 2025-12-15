import { type ChangeEvent, type ReactNode, cloneElement, isValidElement, useState } from 'react';
import { List, Input, Section, Cell, Modal } from '@telegram-apps/telegram-ui';
import ReactCountryFlag from 'react-country-flag';
import { currencies } from '../pages/exchange/currencies';
import { atom, action, computed } from '@reatom/core';
import { reatomComponent } from '@reatom/react';
import { currencyCountryCodes } from '../pages/exchange/country-codes';

const searchCurrenciesAtom = atom('', 'searchCurrenciesAtom');

const onChangeSearch = action((event: ChangeEvent<HTMLInputElement>) => {
  searchCurrenciesAtom.set(event.currentTarget.value);
}, 'onChangeSearch');

const onClearSearch = action(() => {
  searchCurrenciesAtom.set('');
}, 'onClearSearch');

const filteredCurrenciesAtom = computed(
  () =>
    Object.entries(currencies).filter(
      ([code, name]) =>
        code.toLocaleLowerCase().includes(searchCurrenciesAtom().toLocaleLowerCase()) ||
        name.toLocaleLowerCase().includes(searchCurrenciesAtom().toLocaleLowerCase())
    ),
  'filteredCurrenciesAtom'
);

interface CurrencySelectProps {
  opener: ReactNode;
  onSelect?: (currencyCode: string) => void;
}

export const CurrencySelectModal = reatomComponent<CurrencySelectProps>(({ opener, onSelect }) => {
  const [isOpen, setOpen] = useState(false);
  const search = searchCurrenciesAtom();
  const filteredCurrencies = filteredCurrenciesAtom();

  const _opener = isValidElement<{ onClick?: () => void }>(opener)
    ? cloneElement(opener, { onClick: () => setOpen(true) })
    : opener;

  return (
    <>
      {_opener}
      <Modal
        open={isOpen}
        onOpenChange={(value) => {
          if (!value) {
            setOpen(false);
            onClearSearch();
          }
        }}
      >
        <Modal.Header>Choose currency</Modal.Header>
        <div style={{ padding: '0 16px' }}>
          <Input
            header="Currencies"
            placeholder="Search currency"
            onChange={onChangeSearch}
            value={search}
          />
        </div>
        <List style={{ height: 'calc(100vh - 400px)', overflow: 'auto' }}>
          {filteredCurrencies.map(([code, name]) => (
            <Section key={code}>
              <Cell
                before={
                  <ReactCountryFlag
                    countryCode={currencyCountryCodes[code]}
                    style={{
                      fontSize: '2em',
                      lineHeight: '2em',
                    }}
                  />
                }
                subtitle={name}
                onClick={() => {
                  onSelect?.(code);
                  setOpen(false);
                  onClearSearch();
                }}
              >
                {code}
              </Cell>
            </Section>
          ))}
        </List>
      </Modal>
    </>
  );
}, 'CurrencySelectModal');
