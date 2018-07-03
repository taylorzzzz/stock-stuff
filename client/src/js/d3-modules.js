import { extent } from "d3-array";
import { scaleLinear, scaleTime, scaleBand } from "d3-scale";
import { select, selectAll } from 'd3-selection';
import { line } from 'd3-shape';
import { axisBottom, axisLeft } from 'd3-axis';
import { timeFormat } from 'd3-time-format';

export default {
    timeFormat: timeFormat,
    axisBottom: axisBottom,
    axisLeft: axisLeft,
    line: line,
    extent: extent,
    scaleBand: scaleBand,
    scaleTime: scaleTime,
    scaleLinear: scaleLinear,
    select: select,
    selectAll: selectAll
}