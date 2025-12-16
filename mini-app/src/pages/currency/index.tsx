import { Section, Cell, List, Chip, Placeholder, Spinner } from '@telegram-apps/telegram-ui';
import { useEffect, useMemo } from 'react';
import { Page } from '@/components/Page.tsx';
import ReactCountryFlag from 'react-country-flag';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { reatomComponent } from '@reatom/react';
import { wrap } from '@reatom/core';
import { targetCurrenciesAtom } from '../exchange/model';
import { currencyCountryCodes } from '../exchange/country-codes';
import { formatMoney } from '../../helpers/money';
import {
  currentCurrencyAtom,
  historicalFilterAtom,
  historicalRatesAtom,
  isLoadingHistoricalRatesAtom,
  historicalRatesErrorAtom,
  primaryCurrencyAtom,
  onChangeHistoricalFilterAction,
  setCurrentCurrencyFromUrl,
  fetchHistoricalRates,
} from './model';
import { Chart } from 'react-google-charts';
import { miniApp, useSignal } from '@telegram-apps/sdk-react';
import { getHistoricalRatesCache, prepareRates, withChartData } from '@/pages/currency/utils';

import './CurrencyPage.css';

export const CurrencyPage = reatomComponent(() => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const historicalFilter = historicalFilterAtom();
  const primaryCurrency = primaryCurrencyAtom();
  const currentCurrency = currentCurrencyAtom();
  const targetCurrencies = targetCurrenciesAtom();
  const currentRate = targetCurrencies.find((r) => r.currency === currentCurrency);

  const historicalRates = historicalRatesAtom();
  const isLoadingHistoricalRates = isLoadingHistoricalRatesAtom();
  const historicalRatesError = historicalRatesErrorAtom();
  const isDark = useSignal(miniApp.isDark);

  useEffect(
    wrap(() => {
      setCurrentCurrencyFromUrl(searchParams);
    }),
    [searchParams]
  );

  useEffect(
    wrap(() => {
      if (currentCurrency && primaryCurrency) {
        fetchHistoricalRates();
      }
    }),
    [currentCurrency, primaryCurrency, historicalFilter]
  );

  const historicalData = useMemo(() => {
    if (historicalRates.length) {
      return withChartData(prepareRates(historicalRates));
    }

    return withChartData(getHistoricalRatesCache());
  }, [historicalRates]);

  useEffect(() => {
    if (!currentCurrency || !primaryCurrency) {
      navigate('/');
    }
  }, [currentCurrency, primaryCurrency, navigate]);

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
              onClick={wrap(() => onChangeHistoricalFilterAction('3d'))}
            >
              3d
            </Chip>
            <Chip
              disabled={isLoadingHistoricalRates}
              mode={historicalFilter === '1w' ? 'mono' : 'outline'}
              onClick={wrap(() => onChangeHistoricalFilterAction('1w'))}
            >
              1w
            </Chip>
            <Chip
              disabled={isLoadingHistoricalRates}
              mode={historicalFilter === '1m' ? 'mono' : 'outline'}
              onClick={wrap(() => onChangeHistoricalFilterAction('1m'))}
            >
              1m
            </Chip>
            <Chip
              disabled={isLoadingHistoricalRates}
              mode={historicalFilter === '1y' ? 'mono' : 'outline'}
              onClick={wrap(() => onChangeHistoricalFilterAction('1y'))}
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
