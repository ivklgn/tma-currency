import { Section, Cell, List, Chip, Placeholder, Spinner } from '@telegram-apps/telegram-ui';
import { useEffect, useMemo, type FC } from 'react';
import { Page } from '@/components/Page.tsx';
import ReactCountryFlag from 'react-country-flag';
import { useNavigate } from 'react-router';
import { useAction, useAtom } from '@reatom/npm-react';
import { targetCurrenciesAtom } from '../exchange/model';
import { currencyCountryCodes } from '../exchange/country-codes';
import { formatMoney } from '../../helpers/money';
import {
  currentCurrencyAtom,
  historicalFilterAtom,
  historicalRatesAtom,
  onChangeHistoricalFilterAction,
  primaryCurrencyAtom,
} from './model';
import { Chart } from 'react-google-charts';
import { classNames, miniApp, useSignal } from '@telegram-apps/sdk-react';

import './CurrencyPage.css';

function getRandomArbitrary(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export function generateFakeRates(startDate: Date, numberRange: [number, number]) {
  return Array.from({ length: 8 }).map(() => {
    const date = new Date(startDate.setDate(startDate.getDate() + 1)).toISOString().split('T')[0];

    return [date, getRandomArbitrary(...numberRange)];
  });
}

const fakeHistoricalData = [['date', 'rate'], ...generateFakeRates(new Date(), [19, 20])];

export const CurrencyPage: FC = () => {
  const navigate = useNavigate();
  const [historicalFilter] = useAtom(historicalFilterAtom);
  const [primaryCurrency] = useAtom(primaryCurrencyAtom);
  const [currentCurrency] = useAtom(currentCurrencyAtom);
  const [currentRate] = useAtom(
    (ctx) => ctx.spy(targetCurrenciesAtom).filter((r) => r.currency === currentCurrency)?.[0],
    [currentCurrency]
  );

  const handleChangeHistoricalFilterAction = useAction(onChangeHistoricalFilterAction);
  const [historicalRates] = useAtom(historicalRatesAtom.dataAtom);
  const [isLoadingHistoricalRates] = useAtom((ctx) => ctx.spy(historicalRatesAtom.pendingAtom) > 0);
  const [historicalRatesError] = useAtom(historicalRatesAtom.errorAtom);
  const isDark = useSignal(miniApp.isDark);

  const historicalData = useMemo(
    () => [['date', 'rate'], ...historicalRates.map((hr) => [hr.date, hr.rate])],
    [historicalRates]
  );

  useEffect(() => {
    if (!currentCurrency || !primaryCurrency) {
      navigate('/');
    }
  }, [currentCurrency]);

  if (!currentRate) {
    return null;
  }

  return (
    <Page back>
      <List>
        <Cell
          before={
            <ReactCountryFlag
              countryCode={currencyCountryCodes[currentRate.currency]}
              style={{
                fontSize: '2em',
                lineHeight: '2em',
              }}
            />
          }
          subtitle={`${formatMoney(1, primaryCurrency)} ${primaryCurrency} = ${formatMoney(
            currentRate.rate,
            currentRate.currency
          )} ${currentRate.currency}`}
        >
          {`${formatMoney(currentRate.rate || 1, currentRate.currency)} ${currentRate.currency} `}
        </Cell>

        {!historicalRatesError && historicalData.length > 0 && (
          <div
            style={{
              display: 'flex',
              gap: 16,
            }}
          >
            <Chip
              disabled={isLoadingHistoricalRates}
              mode={historicalFilter === '3d' ? 'mono' : 'outline'}
              onClick={() => handleChangeHistoricalFilterAction('3d')}
            >
              3d
            </Chip>
            <Chip
              disabled={isLoadingHistoricalRates}
              mode={historicalFilter === '1w' ? 'mono' : 'outline'}
              onClick={() => handleChangeHistoricalFilterAction('1w')}
            >
              1w
            </Chip>
            <Chip
              disabled={isLoadingHistoricalRates}
              mode={historicalFilter === '1m' ? 'mono' : 'outline'}
              onClick={() => handleChangeHistoricalFilterAction('1m')}
            >
              1m
            </Chip>
            <Chip
              disabled={isLoadingHistoricalRates}
              mode={historicalFilter === '1y' ? 'mono' : 'outline'}
              onClick={() => handleChangeHistoricalFilterAction('1y')}
            >
              1y
            </Chip>
          </div>
        )}

        {!historicalRatesError && historicalData.length > 0 && (
          <Section>
            <div className="chartWrapper">
              {isLoadingHistoricalRates && (
                <div className="chartSpinner">
                  <Spinner size="m" />
                </div>
              )}

              <Chart
                className={classNames(isLoadingHistoricalRates && 'chart_withBlur')}
                chartType="LineChart"
                width="100%"
                height="340px"
                data={historicalRates.length ? historicalData : fakeHistoricalData}
                options={{
                  curveType: 'function',
                  backgroundColor: {
                    fill: isDark ? '#0f0f0f' : '#fff',
                    stroke: '',
                    strokeWidth: 0,
                  },
                  legend: 'none',
                  hAxis: {
                    gridlines: { count: 3 },
                    textStyle: {
                      color: isDark ? '#708499' : '#0f0f0f',
                    },
                  },
                  vAxis: {
                    textStyle: {
                      color: isDark ? '#708499' : '#0f0f0f',
                    },
                  },
                }}
              />
            </div>
          </Section>
        )}

        {historicalRatesError && (
          <Placeholder header="Oops, something went wrong" description="Reload app or try later">
            <img
              alt="Telegram sticker"
              src="https://xelene.me/telegram.gif"
              style={{ display: 'block', width: '144px', height: '144px' }}
            />
          </Placeholder>
        )}
      </List>
    </Page>
  );
};
