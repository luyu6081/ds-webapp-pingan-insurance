
export const HISTORY_COLUMNS = function () {
  return [
    {
      label: '标准得分',
      render: (row) => {
        let className = ['score']
        if (row.score < 0) {
          className.push('green')
        }
        return ((h) => {
          return (
            <span class={className.join(' ')}>{row.score}</span>
          )
        })(this.$createElement)
      },
    },
    {
      prop: 'createTm',
      label: '评分时间',
    },
    {
      prop: 'name',
      label: '错误分',
    },
    {
      prop: 'errorRate',
      label: '错误率',
    },
    {
      prop: 'completeScore',
      label: '落地分',
    },
    {
      prop: 'checkCorrectNumber',
      label: '落地信息项',
    },
  ]
}
