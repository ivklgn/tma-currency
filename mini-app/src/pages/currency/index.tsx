import { Section, Cell, List, Placeholder, Spinner } from '@telegram-apps/telegram-ui';
import { lazy, Suspense, useEffect, useMemo } from 'react';
import { Page } from '@/components/Page.tsx';
import ReactCountryFlag from 'react-country-flag';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { reatomComponent } from '@reatom/react';
import { targetCurrenciesAtom } from '../exchange/model';
import { currencyCountryCodes } from '../exchange/country-codes';
import { formatMoney } from '../../helpers/money';
import {
  currentCurrencyAtom,
  historicalRatesCacheAtom,
  primaryCurrencyAtom,
  fetchHistoricalRates,
} from './model';
import { miniApp, useSignal } from '@telegram-apps/sdk-react';
import { withChartData } from '@/pages/currency/utils';

const Chart = lazy(() => import('react-google-charts').then((m) => ({ default: m.Chart })));

import './CurrencyPage.css';

export const CurrencyPage = reatomComponent(() => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const primaryCurrency = primaryCurrencyAtom();
  const currentCurrency = currentCurrencyAtom();
  const targetCurrencies = targetCurrenciesAtom();
  const currentRate = targetCurrencies.find((r) => r.currency === currentCurrency);

  const historicalRates = fetchHistoricalRates.data();
  const isLoadingHistoricalRates = fetchHistoricalRates.pending() > 0;
  const historicalRatesError = fetchHistoricalRates.error();
  const isDark = useSignal(miniApp.isDark);

  // Sync URL params to atom
  useEffect(() => {
    const currency = searchParams.get('currency') || '';
    currentCurrencyAtom.set(currency);
  }, [searchParams]);

  // Fetch historical rates when currencies change
  useEffect(() => {
    if (currentCurrency && primaryCurrency) {
      fetchHistoricalRates();
    }
  }, [currentCurrency, primaryCurrency]);

  const historicalData = useMemo(() => {
    const data = historicalRates.length ? historicalRates : historicalRatesCacheAtom();
    return withChartData(data);
  }, [historicalRates]);

  // Early return for navigation guard
  if (!currentCurrency || !primaryCurrency) {
    navigate('/');
    return null;
  }

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
          <Section>
            <div className="chartWrapper">
              {isLoadingHistoricalRates && (
                <div className="chartSpinner">
                  <Spinner size="m" />
                </div>
              )}

              <Suspense
                fallback={
                  <div className="chartSpinner">
                    <Spinner size="m" />
                  </div>
                }
              >
                <Chart
                  className={`chart${isLoadingHistoricalRates ? ' chart_loading' : ''}`}
                  chartType="LineChart"
                  width="100%"
                  height="340px"
                  data={historicalData}
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
              </Suspense>
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
}, 'CurrencyPage');
