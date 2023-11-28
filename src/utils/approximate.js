export default function (num, dp) {
  const multiplier = Math.pow(10, dp);
  return Math.round(num * multiplier) / multiplier;
}
