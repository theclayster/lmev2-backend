module.exports = {
  type_uniswap: {
    add_lp: "addLiquidity",
    remove_lp: "removeLiquidity",
  },
  vault: {
    bronze: "bronze",
    silver: "silver",
    gold: "gold",
    platinum: "platinum",
  },
  reward: {
    platinum: {
      APY: 70,
      TIME_APPROXX: 2592000,
      TOTAL_DAY: 30,
      type: "platinum",
    },
    gold: {
      APY: 50,
      TIME_APPROXX: 1209600,
      TOTAL_DAY: 14,
      type: "gold",
    },
    silver: {
      APY: 35,
      TIME_APPROXX: 604800,
      TOTAL_DAY: 7,
      type: "silver",
    },
    bronze: {
      APY: 25,
      TIME_APPROXX: 259200,
      TOTAL_DAY: 3,
      type: "bronze",
    },
  },
};
