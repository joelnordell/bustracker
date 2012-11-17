all: install-npm-modules

install-npm-modules: \
	lib/node_modules/commander 	\
	lib/node_modules/xml2js		\
	lib/node_modules/underscore	\
	lib/node_modules/querystring	\
	lib/node_modules/sprintf	\
	lib/node_modules/micro-strptime

lib/node_modules/commander:
	@(cd lib; npm install commander@1.0.5)

lib/node_modules/xml2js:
	@(cd lib; npm install xml2js@0.2.2)

lib/node_modules/underscore:
	@(cd lib; npm install underscore@1.4.2)

lib/node_modules/querystring:
	@(cd lib; npm install querystring@0.1.0)

lib/node_modules/sprintf:
	@(cd lib; npm install sprintf@0.1.1)

lib/node_modules/micro-strptime:
	@(cd lib; npm install micro-strptime@0.2.1)
