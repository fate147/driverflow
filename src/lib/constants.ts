export const DISTRICTS = [
  '汉口区',
  '黄陂区',
  '新洲区',
  '东西湖区',
  '洪山青山区',
  '江夏区',
  '武昌区',
  '汉阳区',
  '汉南区',
  '蔡甸区',
] as const

export type District = typeof DISTRICTS[number]
