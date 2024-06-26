import { withStyles } from "@material-ui/core/styles";
import LinearProgress from "@material-ui/core/LinearProgress";

const BorderLinearProgress = withStyles((theme) => ({
  root: {
    height: 10,
    borderRadius: 5,
  },
  bar: {
    borderRadius: 5,
  },
}))(LinearProgress);

export default BorderLinearProgress;
