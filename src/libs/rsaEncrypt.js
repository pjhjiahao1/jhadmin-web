import JSEncrypt from 'jsencrypt/bin/jsencrypt'

// 密钥对生成 http://web.chacuo.net/netrsakeypair

const publicKey = 'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDSLjiqNm/MVLV+7VAlYa4w5ZOr\n' +
'yWL3NpbUNWs0HX9vtMTafAqlrNcxsRXcLBabbBnNB1Ad9hnVSPk0mCt4LDm2W4zD\n' +
'vHWPEWPdLDQXXMUT+Ndt/LKGCA2CBomCYTDLIxUXWqrfmhWRfgkXZPIN36hrbrOR\n' +
'yFI0Acz9k0JLNCBeXQIDAQAB'

const privateKey = 'MIICdgIBADANBgkqhkiG9w0BAQEFAASCAmAwggJcAgEAAoGBANIuOKo2b8xUtX7t\n' +
'UCVhrjDlk6vJYvc2ltQ1azQdf2+0xNp8CqWs1zGxFdwsFptsGc0HUB32GdVI+TSY\n' +
'K3gsObZbjMO8dY8RY90sNBdcxRP41238soYIDYIGiYJhMMsjFRdaqt+aFZF+CRdk\n' +
'8g3fqGtus5HIUjQBzP2TQks0IF5dAgMBAAECgYEAzphWZKFbpSqCuH/GLuhkE3Ym\n' +
'gE5U9BD5kx/q/3AbSo8SjHwu7wkFAbhCd4fytNU+SzVr//dfDzJKmvMUj2xRUHEO\n' +
'fgspnxeDPwqoWSWrppFZymUK0v+wB+hE99t2uUmkhlG6Kl0sk9vguKNuZFNP6JHv\n' +
'SXazLe6aWPPnOvfxGhUCQQDy6YTTrIkFfjvEcWr3+oVS0aTvuEWKBudfmbqDi0ru\n' +
'2vAHGLRg2GFXWqg0tRuX0KcZ/0QQcqbMjcMS00QjjAKHAkEA3YE8aj88lr8h32VJ\n' +
'HJOq6VcnVowJjc1pgzoX/M7jCBKvJfKd9oo4OngyAyg3EUZwV2QrrVsESgy3jM3R\n' +
'y/v8+wJAc3BIgHPJNkQUUTn5NNnojEA3Gvk+iubXBBbBjYwf0z1WvnieGDwcnm/l\n' +
'6g57i31MPE2UYiCqZiGkqAigpCgAdwJAVrQApwILwGIeayhlXuc6bk3sGweDsdrm\n' +
'4zP5Mb71xTIzFuKKDHf8HH7x7KRwMbXlwX93TUskOawSqO3jojoHwwJAJXCNcATg\n' +
'rzznlq5KPmfXF826EWp9I4ot68mr8VjNOgtdhpGEYBfRf9CLQsjPz/trm+4rzCUy\n' +
'Oyk8QkXAyqaDzg=='

// 加密
export function encrypt (txt) {
  const encryptor = new JSEncrypt()
  encryptor.setPublicKey(publicKey) // 设置公钥
  return encryptor.encrypt(txt) // 对需要加密的数据进行加密
}

// 解密
export function decrypt (txt) {
  const encryptor = new JSEncrypt()
  encryptor.setPrivateKey(privateKey)
  return encryptor.decrypt(txt)
}