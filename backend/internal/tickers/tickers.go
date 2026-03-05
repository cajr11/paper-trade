package tickers


type BinanceSymbol struct {
	Symbol string `json:"symbol"`
	Status string `json:"status"`
	BaseAsset string `json:"baseAsset"`
	QuoteAsset string `json:"quoteAsset"`
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
			filteredPairs = append(filteredPairs, token)
		}
	}

	er.Symbols = filteredPairs
}


