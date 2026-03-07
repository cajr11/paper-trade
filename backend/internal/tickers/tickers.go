package tickers

import "strings"


type BinanceSymbol struct {
	Symbol string `json:"symbol"`
	Status string `json:"status"`
	BaseAsset string `json:"baseAsset"`
	QuoteAsset string `json:"quoteAsset"`
	BaseAssetIconUrl string `json:"baseAssetIconUrl"`
} 

type BinanceExchangeResult struct {
	Symbols []BinanceSymbol`json:"symbols"`
}


type Ticker struct {
	Symbol string
	BaseAsset string
	QuoteAsset string
	Price float64
}


/** Method to filter for USDT pairs **/
func (er *BinanceExchangeResult) FilterUSDTPairs(){
	var filteredPairs []BinanceSymbol
	symbols := er.Symbols

	for _, token := range symbols {
		if token.QuoteAsset == "USDT" {
			token.BaseAssetIconUrl = "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/refs/heads/master/128/icon/" + strings.ToLower(token.BaseAsset) + ".png"
			filteredPairs = append(filteredPairs, token)
		}
	}

	er.Symbols = filteredPairs
}


