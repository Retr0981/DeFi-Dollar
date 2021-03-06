const assert = require('assert');

const Web3 = require('web3');
const utils = require("./helpers/Utils")
const web3 = new Web3("HTTP://127.0.0.1:8545");

const GroupsContract = artifacts.require("Groups");

const TreasuryContract = artifacts.require("Treasury");

const CyclesContract = artifacts.require("Cycles");

const SavingsConfigContract = artifacts.require("SavingsConfig");

const DaiLendingAdapterContract = artifacts.require("ibDUSDLendingAdapter");

const DaiLendingServiceContract = artifacts.require("ibDUSDLendingService");


const XendFinanceGroup_Yearn_V1 = artifacts.require(
  "XendFinanceGroup_Yearn_V1"
);

const XendFinanceGroup_Yearn_V1Helpers  =artifacts.require("XendFinanceGroup_Yearn_V1Helpers");

const RewardConfigContract = artifacts.require("RewardConfig");

const RewardBridgeContract = artifacts.require("RewardBridge");

const EsusuServiceContract = artifacts.require("EsusuService");
const EsusuAdapterContract = artifacts.require("EsusuAdapter");
const EsusuAdapterWithdrawalDelegateContract = artifacts.require("EsusuAdapterWithdrawalDelegate");


const DaiContractAddress = "0xe9e7cea3dedca5984780bafc599bd69add087d56";

const yDaiContractAddress = "0x4eac4c4e9050464067d673102f8e24b2fcceb350";

const DaiContractABI = require('../abi/DAIContract.json');

const unlockedAddress = "0xEfB826Ab5D566DB9d5Af50e17B0cEc5A60c18AA3";

const daiContract = new web3.eth.Contract(DaiContractABI,DaiContractAddress);

//  Send Dai from our constant unlocked address
async function sendDai(amount, recipient) {

  var amountToSend = BigInt(amount); //  1000 Dai

  console.log(`Sending  ${amountToSend} x 10^-18 Dai to  ${recipient}`);

  await daiContract.methods.transfer(recipient, amountToSend).send({ from: unlockedAddress });

  let recipientBalance = await daiContract.methods.balanceOf(recipient).call();

  console.log(`Recipient Balance: ${recipientBalance}`);


}

//  Approve a smart contract address or normal address to spend on behalf of the owner
async function approveDai(spender,  owner,  amount){

  let approvalResult = await daiContract.methods.approve(spender,amount).send({from: owner});
  console.log({approvalResult});

  console.log(`Address ${spender}  has been approved to spend ${ amount } x 10^-18 Dai by Owner:  ${owner}`);

};

const waitTime = (seconds) =>
      new Promise((resolve) => setTimeout(resolve, seconds * 1000));

contract("XendFinanceGroup_Yearn_V1", async (accounts) => {
  let contractInstance;
 
 

  it("should join a cycle", async () => {


    let treasury = await TreasuryContract.new();

  let cycles = await CyclesContract.new();

  let savingsConfig =  await SavingsConfigContract.new();

  let groups = await GroupsContract.new();

  let esusuService = await EsusuServiceContract.new();

  let rewardConfig = await RewardConfigContract.new(
    esusuService.address,
    groups.address
  );

  let xendFinanceGroup_Yearn_V1Helpers = await XendFinanceGroup_Yearn_V1Helpers.new(groups.address,cycles.address)

  let rewardBridge = await RewardBridgeContract.deployed();

  let daiLendingService = await DaiLendingServiceContract.deployed();

  let daiLendingAdapter = await DaiLendingAdapterContract.deployed(daiLendingService.address);




  contractInstance = await XendFinanceGroup_Yearn_V1.new(
    daiLendingService.address,
    DaiContractAddress,
    groups.address,
    cycles.address,
    treasury.address,
    savingsConfig.address,
    rewardConfig.address,
    rewardBridge.address,
    yDaiContractAddress,
    xendFinanceGroup_Yearn_V1Helpers.address

  );

  console.log(`${daiLendingAdapter.address}-${daiLendingService.address}-${DaiContractAddress}-${groups.address}-${cycles.address}-${treasury.address}-${savingsConfig.address}-${rewardConfig.address}-${rewardBridge.address}-${yDaiContractAddress}-${xendFinanceGroup_Yearn_V1Helpers.address}`)
    await daiLendingService.UpdateAdapter(daiLendingAdapter.address);

    await groups.activateStorageOracle(contractInstance.address);

    await cycles.activateStorageOracle(contractInstance.address)

    await contractInstance.createGroup("njokuAkawo", "N9");
    
    let startTimeStamp = 4 * 86400;

    let duration = 100 * 86400;

    let amountToApprove = BigInt(10000000000000000000);

    let amountToSend = BigInt(10000000000000000000);

    await sendDai(amountToSend, accounts[0]);

  await approveDai(contractInstance.address, accounts[0], amountToApprove);


   let doesGroupExist = await groups.doesGroupExist(1);
   console.log(doesGroupExist)

    await contractInstance.createCycle(1, startTimeStamp, duration, 10, true, 100)
    console.log("Created Cycle")
    let pricePerFullShare =  await daiLendingAdapter.GetPricePerFullShare();
    console.log({pricePerFullShare});

    const joinCycleResult = await contractInstance.joinCycle(1, 2, {from: accounts[0]});
    console.log(joinCycleResult)

    assert.strictEqual( `${joinCycleResult.receipt.status}`, `${true}`);
  });


  it("should activate a cycle ", async () => {

    let treasury = await TreasuryContract.new();

  let cycles = await CyclesContract.new();

  let savingsConfig =  await SavingsConfigContract.new();

  let groups = await GroupsContract.new();

  let esusuService = await EsusuServiceContract.new();

  let rewardConfig = await RewardConfigContract.new(
    esusuService.address,
    groups.address
  );

  let xendFinanceGroup_Yearn_V1Helpers = await XendFinanceGroup_Yearn_V1Helpers.new(groups.address,cycles.address)


  let rewardBridge = await RewardBridgeContract.deployed();

  let daiLendingService = await DaiLendingServiceContract.deployed();

  let daiLendingAdapter = await DaiLendingAdapterContract.deployed(daiLendingService.address);
  daiLendingService.UpdateAdapter(daiLendingAdapter.address);

  contractInstance = await XendFinanceGroup_Yearn_V1.new(
    daiLendingService.address,
    DaiContractAddress,
    groups.address,
    cycles.address,
    treasury.address,
    savingsConfig.address,
    rewardConfig.address,
    rewardBridge.address,
    yDaiContractAddress,
    xendFinanceGroup_Yearn_V1Helpers.address

  );

    await groups.activateStorageOracle(contractInstance.address);

    await cycles.activateStorageOracle(contractInstance.address)

    await contractInstance.createGroup("njokuAkawo", "N9");
    
    let startTimeStamp = 4 * 86400;

    let duration = 100 * 86400;

    let amountToApprove = BigInt(10000000000000000000);

    let amountToSend = BigInt(10000000000000000000);

    await sendDai(amountToSend, accounts[0]);

    await approveDai(contractInstance.address, accounts[0], amountToApprove);

    
    await contractInstance.createCycle(1, startTimeStamp, duration, 10, true, 100)

    await contractInstance.joinCycle(1, 2, {from: accounts[0]});

    let activateResult = await contractInstance.activateCycle(1, {from: accounts[0]});
    console.log({activateResult});
    assert.strictEqual( `${activateResult.receipt.status}`, `${true}`);

  });







  it("should withdraw from a cycle while it's ongoing", async () => {
    let treasury = await TreasuryContract.new();

    let cycles = await CyclesContract.new();
  
    let savingsConfig =  await SavingsConfigContract.deployed();
  
    let groups = await GroupsContract.new();
  
    let esusuAdapterContract = await EsusuAdapterContract.deployed();
    let esusuServiceContract = await EsusuServiceContract.deployed();
    let esusuAdapterWithdrawalDelegateContract = await EsusuAdapterWithdrawalDelegateContract.deployed();  

    let rewardConfig = await RewardConfigContract.new(
      esusuServiceContract.address,
      groups.address
    );
    let xendFinanceGroup_Yearn_V1Helpers = await XendFinanceGroup_Yearn_V1Helpers.new(groups.address,cycles.address)

    let rewardBridge = await RewardBridgeContract.deployed();

    let daiLendingService = await DaiLendingServiceContract.deployed();
  
    let daiLendingAdapter = await DaiLendingAdapterContract.deployed();
    daiLendingService.UpdateAdapter(daiLendingAdapter.address);


    await esusuServiceContract.UpdateAdapter(esusuAdapterContract.address);
    await esusuServiceContract.UpdateAdapterWithdrawalDelegate(esusuAdapterWithdrawalDelegateContract.address);
    await esusuAdapterWithdrawalDelegateContract.UpdateibDUSDLendingService(daiLendingService.address);
    await esusuAdapterWithdrawalDelegateContract.setGroupCreatorRewardPercent(100);


    contractInstance = await XendFinanceGroup_Yearn_V1.new(
      daiLendingService.address,
      DaiContractAddress,
      groups.address,
      cycles.address,
      treasury.address,
      savingsConfig.address,
      rewardConfig.address,
      rewardBridge.address,
      yDaiContractAddress,
      xendFinanceGroup_Yearn_V1Helpers.address

    );
  
      await groups.activateStorageOracle(contractInstance.address);
  
      await cycles.activateStorageOracle(contractInstance.address);

      await rewardConfig.SetRewardParams(
        "100000000000000000000000000",
        "10000000000000000000000000",
        "2",
        "7",
        "10",
        "15",
        "4",
        "60",
        "4"
      );
  
      await rewardConfig.SetRewardActive(false);
      await rewardBridge.grantAccess(contractInstance.address);
  
      await contractInstance.createGroup("njokuAkawo", "N9");
      
      let startTimeStamp = 4 * 86400;
  
      let duration = 100 * 86400;
  
  
      let amountToSend = BigInt(10000000000000000000);


  
      await sendDai(amountToSend, accounts[0]);
  
     const approveResult = await approveDai(contractInstance.address, accounts[0], amountToSend);
  
     console.log(approveResult)
      
      await contractInstance.createCycle(1, startTimeStamp, duration, 10, true, amountToSend);

     

      // should Throw An Error If Cycle Duration Has Not Elapsed And Cycle Is Ongoing
      await utils.shouldThrow(contractInstance.endCycle(1));


      //should throw error because msg.send is not a member of the cycle
      await utils.shouldThrow(contractInstance.withdrawFromCycle(1));
      
      await contractInstance.joinCycle(1, 1);
      await contractInstance.activateCycle(1);


      let cycleFinancials = await cycles.getCycleFinancialsByCycleId(1);
      console.log(`${cycleFinancials.underlyingBalance} ${cycleFinancials.derivativeBalance}`, 'Cycle Financials');


      const withdrawFromCycleWhileItIsOngoingResult  = await contractInstance.withdrawFromCycleWhileItIsOngoing(1);

      assert(withdrawFromCycleWhileItIsOngoingResult.receipt.status == true, "tx receipt is true")


   })




  it("should withdraw from a cycle", async () => {
      
    let treasury = await TreasuryContract.new();

    let cycles = await CyclesContract.new();
  
    let savingsConfig =  await SavingsConfigContract.deployed();
  
    let groups = await GroupsContract.new();
   
    let esusuAdapterContract = await EsusuAdapterContract.deployed();
    let esusuServiceContract = await EsusuServiceContract.deployed();
    let esusuAdapterWithdrawalDelegateContract = await EsusuAdapterWithdrawalDelegateContract.deployed();


  
    let rewardConfig = await RewardConfigContract.new(
      esusuServiceContract.address,
      groups.address
    );

    let xendFinanceGroup_Yearn_V1Helpers = await XendFinanceGroup_Yearn_V1Helpers.new(groups.address,cycles.address)

  
    let rewardBridge = await RewardBridgeContract.deployed();

    let daiLendingService = await DaiLendingServiceContract.deployed();
  
    let daiLendingAdapter = await DaiLendingAdapterContract.deployed();
    daiLendingService.UpdateAdapter(daiLendingAdapter.address);


    

    await esusuServiceContract.UpdateAdapter(esusuAdapterContract.address);
    await esusuServiceContract.UpdateAdapterWithdrawalDelegate(esusuAdapterWithdrawalDelegateContract.address);
    await esusuAdapterWithdrawalDelegateContract.UpdateibDUSDLendingService(daiLendingService.address);
    await esusuAdapterWithdrawalDelegateContract.setGroupCreatorRewardPercent(100);


    contractInstance = await XendFinanceGroup_Yearn_V1.new(
      daiLendingService.address,
      DaiContractAddress,
      groups.address,
      cycles.address,
      treasury.address,
      savingsConfig.address,
      rewardConfig.address,
      rewardBridge.address,
      yDaiContractAddress,
      xendFinanceGroup_Yearn_V1Helpers.address

    );
  
      await groups.activateStorageOracle(contractInstance.address);
  
      await cycles.activateStorageOracle(contractInstance.address);

    await rewardConfig.SetRewardParams(
      "100000000000000000000000000",
      "10000000000000000000000000",
      "2",
      "7",
      "10",
      "15",
      "4",
      "60",
      "4"
    );

    await rewardConfig.SetRewardActive(true);
    await rewardBridge.grantAccess(contractInstance.address);



  
      await contractInstance.createGroup("njokuAkawo", "N9");
      
      let startTimeStamp = 60;
  
      let duration = 10
  
      let amountToApprove = BigInt(10000000000000000000);
  
      let amountToSend = BigInt(10000000000000000000);
  
      await sendDai(amountToSend, accounts[0]);
  
     const approveResult = await approveDai(contractInstance.address, accounts[0], amountToApprove);
  
     console.log(approveResult)
      
      await contractInstance.createCycle(1, startTimeStamp, duration, 10, true, amountToSend);

     
      await cycles.activateStorageOracle(contractInstance.address);

      // should Throw An Error If Cycle Duration Has Not Elapsed And Cycle Is Ongoing
      await utils.shouldThrow(contractInstance.endCycle(1));

      // withdraw from cycle

      // //should throw error because msg.send is not a member of the cycle
      // await utils.shouldThrow(instance.withdrawFromCycle(1));
      
      await contractInstance.joinCycle(1, 1);
      await contractInstance.activateCycle(1);

      await waitTime(11);

      let cycleEndResult = await xendFinanceGroup_Yearn_V1Helpers.getCycleEndCheckResult(1);
      console.log(`${cycleEndResult['0']} ${cycleEndResult['1']} ${cycleEndResult['2']} ${cycleEndResult['3']} ${cycleEndResult['4']} ${cycleEndResult['5']}`,"Cycle End Result")

      await contractInstance.endCycle(1);

      let cycleFinancials = await cycles.getCycleFinancialsByCycleId(1);
      console.log(`${cycleFinancials.underlyingBalance} ${cycleFinancials.derivativeBalance}`, 'Cycle Financials');
    

      const withdrawFromCycleResult  = await contractInstance.withdrawFromCycle(1);

      assert(withdrawFromCycleResult.receipt.status == true, 'tx receipt status is true')


  })

});
