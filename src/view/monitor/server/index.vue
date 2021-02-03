<template>
  <div style="height: 500px">
    <div id="loadId" v-if="spinShow">
      <Spin fix>
        <Icon type="ios-loading" size="18" class="demo-spin-icon-load"></Icon>
        <div>Loading</div>
      </Spin>
    </div>

    <Card style="margin-bottom: 5px;">
      <a href="#" slot="extra" @click.prevent="init">
        <Icon type="ios-loop-strong"></Icon>刷新
      </a>
      <div style="color: #666;font-size: 13px;">
        <span style="margin-right: 28px;">系统：{{sys.os}}</span>
        <span style="margin-right: 28px;">IP：{{sys.ip}}</span>
        <span>项目已不间断运行：{{sys.day}}</span>
      </div>
    </Card>
    <Card style="margin-bottom: 5px;">
      <p slot="title">状态</p>
      <div>
        <row type="flex" justify="space-around" class="code-row-bg">
          <i-col span="4">
            <Tooltip placement="top">
              <div slot="content" style="font-size: 12px;">
                <div style="padding: 3px;">{{ cpu.name }}</div>
                <div style="padding: 3px">{{ cpu.package }}</div>
                <div style="padding: 3px">{{ cpu.core }}</div>
                <div style="padding: 3px">{{ cpu.logic }}</div>
              </div>
              <i-circle
                :percent="parseFloat(cpu.used)"
                dashboard
                :size="170"
                :trail-width="4"
                :stroke-width="5"
                stroke-linecap="square"
                stroke-color="#43a3fb"
              >
                <div class="demo-Circle-custom">
                  <h3>CPU使用率</h3>
                  <p>{{parseFloat(cpu.used)}}%</p>
                  <span>
                    <i>{{ cpu.coreNumber }}核</i>
                  </span>
                </div>
              </i-circle>
            </Tooltip>
          </i-col>
          <i-col span="4">
            <Tooltip placement="top">
              <div slot="content" style="font-size: 12px;">
                <div style="padding: 3px;">总量：{{ memory.total }}</div>
                <div style="padding: 3px">已使用：{{ memory.used }}</div>
                <div style="padding: 3px">空闲：{{ memory.available }}</div>
              </div>
              <i-circle
                :percent="parseFloat(memory.usageRate)"
                dashboard
                :size="170"
                :trail-width="4"
                :stroke-width="5"
                stroke-linecap="square"
                stroke-color="#43a3fb"
              >
                <div class="demo-Circle-custom">
                  <h3>内存使用率</h3>
                  <p>{{parseFloat(memory.usageRate)}}%</p>
                  <span>
                    <i>{{ memory.used }} / {{ memory.total }}</i>
                  </span>
                </div>
              </i-circle>
            </Tooltip>
          </i-col>
          <i-col span="4">
            <Tooltip placement="top">
              <div slot="content" style="font-size: 12px;">
                <div style="padding: 3px;">总量：{{ swap.total }}</div>
                <div style="padding: 3px">已使用：{{ swap.used }}</div>
                <div style="padding: 3px">空闲：{{ swap.available }}</div>
              </div>
              <i-circle
                :percent="parseFloat(swap.usageRate)"
                dashboard
                :size="170"
                :trail-width="4"
                :stroke-width="5"
                stroke-linecap="square"
                stroke-color="#43a3fb"
              >
                <div class="demo-Circle-custom">
                  <h3>交换区使用率</h3>
                  <p>{{parseFloat(swap.usageRate)}}%</p>
                  <span>
                    <i>{{ swap.used }} / {{ swap.total }}</i>
                  </span>
                </div>
              </i-circle>
            </Tooltip>
          </i-col>
          <i-col span="4">
            <Tooltip placement="top">
              <div slot="content" style="font-size: 12px;">
                <div style="padding: 3px">总量：{{ disk.total }}</div>
                <div style="padding: 3px">空闲：{{ disk.available }}</div>
              </div>
              <i-circle
                :percent="parseFloat(disk.usageRate)"
                dashboard
                :size="170"
                :trail-width="4"
                :stroke-width="5"
                stroke-linecap="square"
                stroke-color="#43a3fb"
              >
                <div class="demo-Circle-custom">
                  <h3>磁盘使用率</h3>
                  <p>{{parseFloat(disk.usageRate)}}%</p>
                  <span>
                    <i>{{ disk.used }} / {{ disk.total }}</i>
                  </span>
                </div>
              </i-circle>
            </Tooltip>
          </i-col>
        </row>
      </div>
    </Card>
    <row>
      <i-col span="12">
        <Card style="margin-bottom: 5px;">
          <p slot="title">CPU使用率监控</p>
          <div>
            <v-chart :options="cpuInfo" />
          </div>
        </Card>
      </i-col>
      <i-col span="12">
        <Card style="margin-bottom: 5px;">
          <p slot="title">内存使用率监控</p>
          <div>
            <v-chart :options="memoryInfo" />
          </div>
        </Card>
      </i-col>
    </row>
  </div>
</template>

<script>
import { getData } from "@/api/monitor/monitor";
import { downloadFile } from "@/api/downUtils";
import { Notice } from "iview";
import ECharts from "vue-echarts"; // 在 webpack 环境下指向 components/ECharts.vue
import "echarts/lib/chart/line";
import "echarts/lib/component/polar";
export default {
  name: "server_monitor",
  components: {
    "v-chart": ECharts
  },
  data() {
    return {
      monitor: null,
      spinShow: true,
      sys: {},
      cpu: {},
      memory: {},
      swap: {},
      disk: {},
      cpuInfo: {
        tooltip: {
          trigger: 'axis'
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: []
        },
        yAxis: {
          type: 'value',
          min: 0,
          max: 100,
          interval: 20
        },
        series: [{
          data: [],
          type: 'line',
          areaStyle: {
            normal: {
              color: 'rgb(32, 160, 255)' // 改变区域颜色
            }
          },
          itemStyle: {
            normal: {
              color: '#6fbae1',
              lineStyle: {
                color: '#6fbae1' // 改变折线颜色
              }
            }
          }
        }]
      },
      memoryInfo: {
        tooltip: {
          trigger: 'axis'
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: []
        },
        yAxis: {
          type: 'value',
          min: 0,
          max: 100,
          interval: 20
        },
        series: [{
          data: [],
          type: 'line',
          areaStyle: {
            normal: {
              color: 'rgb(32, 160, 255)' // 改变区域颜色
            }
          },
          itemStyle: {
            normal: {
              color: '#6fbae1',
              lineStyle: {
                color: '#6fbae1' // 改变折线颜色
              }
            }
          }
        }]
      }
    };
  },
  created() {},
  methods: {
    init() {
      getData().then(res => {
        this.sys = res.data.data.sys;
        this.cpu = res.data.data.cpu;
        this.memory = res.data.data.memory;
        this.swap = res.data.data.swap;
        this.disk = res.data.data.disk;
        if (this.cpuInfo.xAxis.data.length >= 8) {
          this.cpuInfo.xAxis.data.shift()
          this.cpuInfo.series[0].data.shift()
          this.memoryInfo.xAxis.data.shift()
          this.memoryInfo.series[0].data.shift()
        }
        // cpu使用率监控
        this.cpuInfo.xAxis.data.push(res.data.data.time)
        this.cpuInfo.series[0].data.push(parseFloat(res.data.data.memory.used))
        this.memoryInfo.xAxis.data.push(res.data.data.time)
        this.memoryInfo.series[0].data.push(parseFloat(res.data.data.memory.usageRate))

        this.spinShow = false;
      });
    }
  },
  destroyed() {
    clearInterval(this.monitor)
  },
  mounted() {
    this.init()
    this.monitor = window.setInterval(() => {
      setTimeout(() => {
        this.init()
      }, 2)
    }, 3500)
  }
};
</script>

<style lang="less">
.demo-spin-icon-load {
  animation: ani-demo-spin 1s linear infinite;
}

#loadId .ivu-spin-fix {
  position: absolute;
  top: unset;
  left: unset;
  z-index: 8;
  width: 100%;
  height: 100%;
  background-color: white;
}
#loadId div .ivu-spin-main {
  top: 30%;
  left: 45%;
}
box-card {
  margin-bottom: 5px;
}
.box-card span {
  margin-right: 28px;
}
.demo-Circle-custom {
  & h1 {
    color: #3f414d;
    font-size: 28px;
    font-weight: normal;
  }
  & p {
    color: #657180;
    font-size: 14px;
    margin: 10px 0 15px;
  }
  & span {
    display: block;
    padding-top: 15px;
    color: #657180;
    font-size: 14px;
    &:before {
      content: "";
      display: block;
      width: 50px;
      height: 1px;
      margin: 0 auto;
      background: #e0e3e6;
      position: relative;
      top: -15px;
    }
  }
  & span i {
    font-style: normal;
    color: #3f414d;
  }
}
</style>
