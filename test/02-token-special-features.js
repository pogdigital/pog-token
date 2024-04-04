const Web3 = require('web3')
const provider = new Web3.providers.HttpProvider('http://localhost:18888')
const truffleAssert = require('truffle-assertions')

const web3 = new Web3(provider)
const BN = web3.utils.BN
const dec18 = new BN('1000000000000000000')
const Token = artifacts.require("PogToken");

contract("Token Special Features", accounts => {
  const owner = accounts[0];
  const alice = accounts[5];
  const bob = accounts[6];
  const carol = accounts[7];

  let tokenName = "Pog Coin";
  let tokenSymbol = "POGS";
  let tokenDecimal = 18;
  let maxSupply = dec18.mul(new BN(2000000000));
  let minter = owner;
  let stakerRewardPerBlock = 10;
  let initDistrWallet = owner;
  let initMintAmount = dec18.mul(new BN(1700000000));
  let admin = owner;
  let token;

  beforeEach(async () => {
    token = await Token.new(tokenName, tokenSymbol, tokenDecimal, maxSupply,
        minter, stakerRewardPerBlock, initDistrWallet, initMintAmount, admin);
  });

  it("admin permission tests", async () => {
    // let errMsg = "Error: VM Exception while processing transaction: revert Only admin can make this call -- Reason given: Only admin can make this call"
    await truffleAssert.reverts(token.updateStakerRewardPerBlock(8888, {from: alice}));
    await truffleAssert.reverts(token.updateMinter(bob, {from: alice}));
    await truffleAssert.reverts(token.setPendingAdmin(bob, {from: alice}));

    // errMsg = "Returned error: VM Exception while processing transaction: revert Only pending admin can make this call"
    await truffleAssert.reverts(token.updateAdmin({from: alice}));
  });

  it("admin changes and token minting", async () => {
    await token.setPendingAdmin(alice, {from: admin});
    adm = await token.admin();
    pendingAdm = await token.pendingAdmin();
    assert.equal(adm, admin, "Incorrect admin"); // admin should not have changed yet
    assert.equal(pendingAdm, alice, "Incorect pending admin"); // the pending admin should have been set to alice

    // let errMsg = "Returned error: VM Exception while processing transaction: revert Only admin can make this call"
    await truffleAssert.reverts(token.updateMinter(bob, {from: alice})); // the admin has not changed yet

    // errMsg = "Returned error: VM Exception while processing transaction: revert Only pending admin can make this call"
    await truffleAssert.reverts(token.updateAdmin({from: admin})); // the original admin cannot make this call

    await token.updateAdmin({from: alice}) // the pending admin sets the admin to herself
    adm = await token.admin();
    assert.equal(adm, alice, "Incorrect admin"); // admin should have changed to alice

    // Now alice becomes the admin, she can change stakerRewardPerBlock
    newStakerRewardPerBlock = new BN(8888);
    srpb = await token.stakerRewardPerBlock();
    assert.equal(srpb.toString(), new BN(stakerRewardPerBlock).toString(), "Incorect stakerRewardPerBlock");

    await token.updateStakerRewardPerBlock(newStakerRewardPerBlock, {from: alice});
    srpb = await token.stakerRewardPerBlock()
    assert.equal(srpb.toString(), new BN(newStakerRewardPerBlock).toString(), "Incorect stakerRewardPerBlock");

    // Now alice can change the minter
    mter = await token.minter();
    assert.equal(mter, admin, "Incorrect minter");
    await token.updateMinter(bob, {from: alice});
    mter = await token.minter();
    assert.equal(mter, bob, "Minter not updated");

    // Now that bob is the minter, he can call mintStakerReward() mint token for carol
    const mintAmount = new BN(9999);
    let carolBalance = await token.balanceOf(carol);
    assert.equal(carolBalance.toString(), new BN(0).toString(), "Incorrect balance");

    // errMsg = "Returned error: VM Exception while processing transaction: revert Only minter can make this call";
    await truffleAssert.reverts(token.mintStakerReward(carol, mintAmount, {from: alice})); // Alice should not be able to mint tokens
    carolBalance = await token.balanceOf(carol);
    assert.equal(carolBalance.toString(), new BN(0).toString(), "Incorrect balance");

    await token.mintStakerReward(carol, mintAmount, {from: bob}); // Bob should be able to mint tokens
    carolBalance = await token.balanceOf(carol);
    assert.equal(carolBalance.toString(), mintAmount.toString(), "Incorrect balance");
  });

});
