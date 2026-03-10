package tickers

import (
	"encoding/json"
	"io"
	"net/http"
)

/**
 Function for getting all tokens against USDT. Fetches all tokens then filters for USDT pairs.
**/
func  getAllPairs() ([]BinanceSymbol, error){
  url := "https://api.binance.com/api/v3/exchangeInfo?permissions=SPOT&showPermissionSets=false"

  res, err := http.Get(url)

  if err != nil {
	return nil, err
  }
  defer res.Body.Close()

  body, err := io.ReadAll(res.Body)

  if err != nil {
	return nil, err
  }

  var data BinanceExchangeResult

  err = json.Unmarshal([]byte(body), &data)

  if err != nil {
  return nil, err
  }

  data.FilterUSDTPairs()

  return data.Symbols, nil

  
}