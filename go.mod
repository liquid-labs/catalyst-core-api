module github.com/Liquid-Labs/catalyst-core-api

require (
	firebase.google.com/go v3.6.0+incompatible
	github.com/Liquid-Labs/catalyst-firewrap v1.0.0-prototype.0
	github.com/Liquid-Labs/go-nullable-mysql v1.0.2
	github.com/Liquid-Labs/go-rest v1.0.0-prototype.4
	github.com/Liquid-Labs/lc-entities-model v1.0.0-alpha.0
	github.com/Liquid-Labs/lc-locations-model v1.0.0-alpha.1
	github.com/Liquid-Labs/lc-users-model v1.0.0-alpha.0
	github.com/Liquid-Labs/terror v0.0.0-20190801223730-3f5389af3ff2
	github.com/google/uuid v1.1.0 // indirect
	github.com/gorilla/handlers v1.4.0
	github.com/gorilla/mux v1.7.0
	github.com/rs/cors v1.6.0
	github.com/stretchr/testify v1.3.0
	googlemaps.github.io/maps v0.0.0-20190206003505-be134e760d70
)

replace github.com/Liquid-Labs/catalyst-firewrap => ../catalyst-firewrap

replace github.com/Liquid-Labs/go-rest => ../go-rest
