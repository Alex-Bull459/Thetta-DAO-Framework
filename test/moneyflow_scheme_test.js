var Microcompany = artifacts.require("./Microcompany");
var StdMicrocompanyToken = artifacts.require("./StdMicrocompanyToken");
var MicrocompanyStorage = artifacts.require("./MicrocompanyStorage");

var MoneyFlow = artifacts.require("./MoneyFlow");
var DefaultMoneyflowScheme = artifacts.require("./DefaultMoneyflowScheme"); 

global.contract('Moneyflow', (accounts) => {
	let token;
	let store;
	let mcInstance;
	let moneyflowInstance;
	let moneyflowScheme;

	let money = web3.toWei(0.001, "ether");

	const creator = accounts[0];
	const output = accounts[1];

	global.beforeEach(async() => {
		token = await StdMicrocompanyToken.new("StdToken","STDT",18,{from: creator});
		await token.mint(creator, 1000);
		store = await MicrocompanyStorage.new(token.address,{gas: 10000000, from: creator});
		mcInstance = await Microcompany.new(store.address,{gas: 10000000, from: creator});

		// 50/50 between reserve fund and dividends 
		moneyflowScheme = await DefaultMoneyflowScheme.new(mcInstance.address, output, 5000, 5000, {from: creator});

		moneyflowInstance = await MoneyFlow.new({from: creator});
		await moneyflowInstance.setRootWeiReceiver(moneyflowScheme.address);

		{
			// manually setup the Default organization 
			await store.addActionByEmployeesOnly("addNewProposal");
			await store.addActionByEmployeesOnly("startTask");
			await store.addActionByEmployeesOnly("startBounty");

			// this is a list of actions that require voting
			await store.addActionByVoting("addNewEmployee");
			await store.addActionByVoting("removeEmployee");
			await store.addActionByVoting("addNewTask");
			await store.addActionByVoting("issueTokens");
			await store.addActionByVoting("upgradeMicrocompany");

			// for moneyscheme!
			await store.addActionByEmployeesOnly("modifyMoneyscheme");
			await store.addActionByVoting("withdrawDonations");

			// add creator as first employee	
			await store.addNewEmployee(creator);	

			// THIS IS REQUIRED because issueTokensAuto() will add new proposal
			await store.addActionByAddress("addNewProposal", aacInstance.address);
			// THIS IS REQUIRED because MoneyflowScheme will add new proposal
			await store.addActionByAddress("addNewProposal", moneyflowScheme.address);
		}

		// do not forget to transfer ownership
		await token.transferOwnership(mcInstance.address);
		await store.transferOwnership(mcInstance.address);
	});

	// TODO: test DefaultMoneyflowScheme 

});
