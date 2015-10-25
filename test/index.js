var _ = require('../build/util')

describe('A suite', function() {

  it('_.date', function() {
    var d = new Date()
    expect(_.date('h:i:s')).toBe(d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds())
  })

  it('_.number', function() {
    expect(_.number(0)).toBe('0')
    expect(_.number()).toBe('NaN')
    expect(_.number(null)).toBe('0')
    expect(_.number(NaN)).toBe('NaN')
  })

  it('_.toFixed', function() {
    expect(_.toFixed(0.0001, 2)).toBe(0)
    expect(_.toFixed(0)).toBe(0)
    expect(isNaN(_.toFixed())).toBe(true)
    expect(_.toFixed(null)).toBe(0)
    expect(isNaN(_.toFixed(NaN))).toBe(true)
  })

  it('_.size', function() {
    expect(_.size(15752)).toBe('16 KB')
  })
})