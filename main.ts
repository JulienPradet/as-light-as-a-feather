/* global fxhash */

import { canvasJp, CanvasJpDrawable, CanvasJpStrokeStyle } from "canvas-jp";
import { prodMode } from "canvas-jp/plugins/prodMode";
import { fxhashCollection } from "canvas-jp/plugins/fxhashCollection";
import { angle } from "canvas-jp/angle";
import { CanvasJpArc, Circle } from "canvas-jp/Circle";
import { CanvasJpColorHsv, Color } from "canvas-jp/Color";
import { distance } from "canvas-jp/distance";
import { CanvasJpFill } from "canvas-jp/draw";
import { inOutSine, inSine, outSine } from "canvas-jp/ease";
import { Line } from "canvas-jp/Line";
import { CanvasJpPoint, Point } from "canvas-jp/Point";
import { PolygonFromRect } from "canvas-jp/Polygon";
import { SmoothShape } from "canvas-jp/Shape";
import { translate } from "canvas-jp/transform";
import { rotate, translateVector } from "canvas-jp/transform";
import { mapRange, clamp } from "canvas-sketch-util/math";

const hashes = [
  {
    generationHash: "oo9XL6q6rq97uzNuomyqjyrm5P8B8Q86ccmrJRsS1adk1ZCgTUB",
    id: 1122375,
  },
  {
    generationHash: "ooDNhQpXXiHi3NztCxQm6CMeYVzftxRXLFbXwhFmkw6tZajoSE9",
    id: 1122367,
  },
  {
    generationHash: "oo7ZoZFXEYNF32xekVgd3BQ8cGv2N2FTrmSHLK7LSJm1Dp8scHS",
    id: 1122356,
  },
  {
    generationHash: "ooGkgEJAXPXd81mEAFAommSVbjLN8bEWwRKP1H2vzpCrV7X3XWd",
    id: 1122314,
  },
  {
    generationHash: "ontXVZLZpdjJDXMFYEcnBLq21YB4ZpE4WjchHFopGrSPZ69K1VG",
    id: 1122312,
  },
  {
    generationHash: "ooDQsmo215XfSANH6h7bJuQ9Nv1RP6t6NMPKcnKgVkFNrs3WsCq",
    id: 1122310,
  },
  {
    generationHash: "oo4GRnVgTZFnngr2KkMtPz4tF6DdHWEiNSDMm6r4DwUsLpgzy4Y",
    id: 1122309,
  },
  {
    generationHash: "ootrQm452gb32MDRmSJCAet3yLqDESZZHMgPsmdBh4EYCXFofyi",
    id: 1122308,
  },
  {
    generationHash: "oostD5wrY1cxFv2b7HE3g3UaWViDefUH2UsUsHaPuWxXcomRChQ",
    id: 1122307,
  },
  {
    generationHash: "oo2DBv61JF4Mhcd13yTbxxM3tmxV3rVhqoH773ccEqqttLZ7j5N",
    id: 1122306,
  },
  {
    generationHash: "oo6BJDGxzy9JwCs5V2ZotJNi1JAgXvm23wkzdc5JJPJJEAowBT6",
    id: 1122305,
  },
  {
    generationHash: "oogE8rpV5pgkBxRFwYp3y949D8qNfqWw87nQb2UJbP3xvLaRvph",
    id: 1122304,
  },
  {
    generationHash: "opYyB1EaGmyjnmbY4Gr47tswvQYwvmmPgQhTfZno1TW3d6GWUfR",
    id: 1122303,
  },
  {
    generationHash: "opVDYWdCQLgeGdFL1UFgD34CvWyrLSeM7WtUmAaeJ1NhK4nVFRF",
    id: 1122302,
  },
  {
    generationHash: "ongHKDMp8XXwyD9KCG1iyEmrh15WiepTuTo2u7dALDhttHJ3f3y",
    id: 1122301,
  },
  {
    generationHash: "oo7ZKjZsfwQYMix9Ci63gaHUhep8c9N8pm6bwm6w3bAFrZdFBKK",
    id: 1122300,
  },
  {
    generationHash: "op8ziWYwVQnA6ut1uCsH9ELSNowvb5pxaiTudkkkyYcevdY1rX1",
    id: 1122299,
  },
  {
    generationHash: "onzvZyp2UUhxr89hYobbYzx9ZTsoynbXYz97FKMbBqpUcZX3XCf",
    id: 1122298,
  },
  {
    generationHash: "oo6EaML2GDTFuFoUqTCNBWGZvM7s2TCsBC8cSy32adfKxhHjDDm",
    id: 1122297,
  },
  {
    generationHash: "opAPYGJis62rtTCf9vKQTVftcNHRtkmw2xE8J5ePPZKh73gE5cQ",
    id: 1122296,
  },
  {
    generationHash: "onw2ZWLJN9exG3pK1vx65ZGkRNsBLQ1aSDmFNMkjXt5vXU2NqRq",
    id: 1122295,
  },
  {
    generationHash: "opXE5r6X84PoNQvBmCzGfFdQt5TumNrjkTp86tGaaxUG5tTGLwr",
    id: 1122294,
  },
  {
    generationHash: "onr7yBVSnxDQJwzCJKy2MVKEUNfMaAEprj9YWE2E1MtStrgcAJo",
    id: 1122293,
  },
  {
    generationHash: "opJi3Hp4X4mCtiaUpZMEoXeNChyM9656oLLSbbsJETrNSSqc4Fd",
    id: 1122292,
  },
  {
    generationHash: "ooboHUZFoXriJhZpHQNp2v7S9kV5p6ufohBhmVxwwmWLfZWLh4t",
    id: 1122291,
  },
  {
    generationHash: "ooqMfK3SHw42QvT12NtHtUUy2EGDvNFZ89J8N71T4pkMoTCNQ9U",
    id: 1122290,
  },
  {
    generationHash: "onhHC1Wa7vb3z61y2MR8iNFYV2Tahe66ab1FbKRwDtMeijj7oRx",
    id: 1122289,
  },
  {
    generationHash: "ooMvfrgysof9Wmxhn9bsPYUxB2yHxHJzc6ir7Sg9zbDxjgVeZiX",
    id: 1122287,
  },
  {
    generationHash: "oox6oMdZyCyPyAkei2w9DKaMbZr7ZAovVRYQzbBtoEYezejnfvL",
    id: 1122286,
  },
  {
    generationHash: "opRjT9DVhWRbRnMaoQBimrF2h31VQQQqs9tEDmDc7qtKLQJFLwc",
    id: 1122285,
  },
  {
    generationHash: "ooGi35KeZk1Ef5Gn2t1sqJmd62VT5R7wqU9YZ4txFGzbZRVR6JJ",
    id: 1122284,
  },
  {
    generationHash: "ooi7q1ZuN5eMpd2WjK8HHBjaEQe2ferV5BmJHFqSyKpWz8Jha3a",
    id: 1122283,
  },
  {
    generationHash: "ooZNoymFX2Y2j4Vf3H22tW7RnxB9FJBjcCv8oQDSQoNVeUsdtsY",
    id: 1122282,
  },
  {
    generationHash: "op3bSrKmA3SicMKKCS5BVgS2pnKWgofuXTu23JJysCGsLTa84uY",
    id: 1122281,
  },
  {
    generationHash: "opKhL7hxoV6AEh3Z3J4G2cTe4tZZBrfwzqV8PWrG8hjUXDHCJ33",
    id: 1122280,
  },
  {
    generationHash: "ooGyvbEism4TX2U8WoKnnCePZXJaUq6qjfrYV7Rnex7KoqDrS3s",
    id: 1122279,
  },
  {
    generationHash: "oohAL9TaF7Yog8XERCieKQnnHGeu2ig5Mi34nB9gfSzvwLtFain",
    id: 1122278,
  },
  {
    generationHash: "oornJLo6iPz8W8YuzJ2wX4FZ1WAgePMn3aUZRuLKpPPqHBJ2R3Z",
    id: 1122277,
  },
  {
    generationHash: "ooRYRq1Lq3jsYGK9VTTbyL99vToJ9odQis7FXS166Pj6k8vGp7p",
    id: 1122276,
  },
  {
    generationHash: "oo1ihA73dPrEtMi8HerfDv69AdhFXWCB2aSNJbMLzu15F7KEU7q",
    id: 1122275,
  },
  {
    generationHash: "oopwdfLQMxYJYUBAs6co9yK2Y5WozaRs327Rej7vmzAT783qqKJ",
    id: 1122274,
  },
  {
    generationHash: "ooc5YZzo8pkEtm3VGbfLXSLTVTRnCVMpgk2aGyd22VPEi3b8CPX",
    id: 1122273,
  },
  {
    generationHash: "onqZXMKENSeCJwas5Brh5KBGwNk8g24zAFD1huNN652YKXgJK9v",
    id: 1122272,
  },
  {
    generationHash: "oob3Bqw3thXzpKaxk5XH9N99XgX2WUbRVnjV85uaBcRfkLa579U",
    id: 1122271,
  },
  {
    generationHash: "opLTJni2YPAb5d97FmFmL8z2JNBPagosVuNTiQbkgZtJ8NC7VLS",
    id: 1122270,
  },
  {
    generationHash: "ooe2beRpU3jrMxSbnBUycCPFYKCjA5dHSBDZvFHKRDvgR8xXqSd",
    id: 1122269,
  },
  {
    generationHash: "op2ddA6m2QVgovXg1nExWbinoExkfDs4QXJh7WwPzfsrESK7y4R",
    id: 1122268,
  },
  {
    generationHash: "ooLyN4uPh7swS6yyA8UcV7AYuFsWSCXU6taMrYjJ9qJ8kvPpEkK",
    id: 1122267,
  },
  {
    generationHash: "oo2HBms8ZnJNNrXiTxLcPpEMxtJL1jzvpsAZDDHBWTq82JGTF9h",
    id: 1122266,
  },
  {
    generationHash: "ooX7nR1fcSFbFyogt4su72rUSWqJhtTsACver1S2Jh9fQQzM5F4",
    id: 1122265,
  },
  {
    generationHash: "oniLUEcwozvjcQ5VgH7C7t8qMMBqRdURz9S1nuGvjusyYqrTYYi",
    id: 1122264,
  },
  {
    generationHash: "onyH7HVVhkVECq6XtkZTD8Te4asr4LYbgfdCbV1VFL1k9j6vjQA",
    id: 1122263,
  },
  {
    generationHash: "ooCip1HjHvTZoCR2Tg7AzKU6BQgSoLvDYSPga3ez57eB9ewLS2j",
    id: 1122262,
  },
  {
    generationHash: "onxyE666nYvAH5P5AkqdDp9YkrQvy99J2i9EaPJG4xY6GwZDJNt",
    id: 1122260,
  },
  {
    generationHash: "op62hVYG2CjPFPQDfw5GWqPgYTq2X47b1qVsfd3MQ6SMxABjXV2",
    id: 1122259,
  },
  {
    generationHash: "oowApTKYjarfE7kEVoQH8XvGZkbDr46F8uptdWZHpUDki6p8mwz",
    id: 1122258,
  },
  {
    generationHash: "opTFiv3ukM74zdyvVVwsLTapY7ELujMcLqYmHFpFs9oGTxztSqq",
    id: 1122257,
  },
  {
    generationHash: "ootF7QRpPSh21t3P7oxS4BY1Lcrtumu7YRwLpZW1K4Ve4GP2Be4",
    id: 1122256,
  },
  {
    generationHash: "ooEkHL3Enn5ovP8iKQrn1nMd54swVdusuKfygk5JJjkcX6xzuDe",
    id: 1122255,
  },
  {
    generationHash: "opN8gxZfrAUZL1mmFjq7YpqiuFpXordTQt2Yxi8GhptUC7Xx8TG",
    id: 1122254,
  },
  {
    generationHash: "ooVct7KDrfTCTCHaRyBBMmUxGUYA3azbzZgsCynjwMyGYFm3aP1",
    id: 1122253,
  },
  {
    generationHash: "ooQWDBeWpyytrhhpG5wj5Ztygvx1XtpxWLRV4e9UnGCHXT45wUA",
    id: 1122252,
  },
  {
    generationHash: "oox8ymxaXUV6U9LWa6KuLxVkhUFUMsZVyf7Mj5QMN5T7owbXgTh",
    id: 1122251,
  },
  {
    generationHash: "onhXYuiB6Rp55MxhbgWtXLxTKJn7e6VfSc31te5ae4mRFvyxVf2",
    id: 1122249,
  },
  {
    generationHash: "oouQVjjETZJs7suqqi4NWkTsoLqLrTncf5jyiqALp5Rrstc7zh5",
    id: 1122248,
  },
  {
    generationHash: "oonmAV1Cw1SeBJEWxLt8gohqkJT7xS845QTBw9KdFE77PzM8AZu",
    id: 1122247,
  },
  {
    generationHash: "oonUgWuVVLqx6zHzmFN6FMX1XtYfRrEfRHYY31pthJYRyqSupgi",
    id: 1122246,
  },
  {
    generationHash: "ooBQfbey3zgbHgFisJpmvCznXQDfSbMXRMLZesK977nvZQJ6ek5",
    id: 1122245,
  },
  {
    generationHash: "opS35Vy8b37vpMCDzzou55mdAJHM5FzPrJ2yvpJLad1rSheiXtW",
    id: 1122244,
  },
  {
    generationHash: "onyuSWUMLnmY53kPxL7rryULxRNmFyc5x96N37rzhj9xPyDwhPa",
    id: 1122243,
  },
  {
    generationHash: "ooUmLL6Uu6at53S3Zzbrj7NkxMj3oHTrodwfRQz7BxDERVgw1Ze",
    id: 1122242,
  },
  {
    generationHash: "onfFSHXmJnwFFpoWRiwZ2NtUwG3CqERg8DGshU8MbESGCkF4H1f",
    id: 1122241,
  },
  {
    generationHash: "onh5ow5UYpBqSMboqVXLVCgEywNkmHRzJ4Thjrjzgt7FWN3Paev",
    id: 1122240,
  },
  {
    generationHash: "ooPmfZhwNio8VNr6VJ9uZcMiRE5hfgFvPKoPUHfCqEv81UVcrtJ",
    id: 1122239,
  },
  {
    generationHash: "ooqgHJMUsAeFbZPBkvqEFocSUQmD5EU1iAzhkYjkHa5iNvD7hbx",
    id: 1122238,
  },
  {
    generationHash: "ooZdJQ9CyKrQ1rspuAUN4SY9mVP1gYRurdqWmHLLo6xT2sb11Qt",
    id: 1122237,
  },
  {
    generationHash: "ooLVpurv4q2pw72w12aoFbtNMWfzsC5A4j9paRdkwMzzE9pUA65",
    id: 1122236,
  },
  {
    generationHash: "ooQxgNv7vc9VyQgBgnqY17SE8E5npnK6heWihveSHybP7CfnU49",
    id: 1122235,
  },
  {
    generationHash: "ooqC16YUbK4KnHyQKRHQDxH3WrHUYr7cvW29WfXUabmGBCHJqd4",
    id: 1122234,
  },
  {
    generationHash: "onq7ubA4BC589aLsShUwVQXTtvFjhBjMHJeequfdVp3StFSr4eq",
    id: 1122233,
  },
  {
    generationHash: "ooyDWLQbdBz6YaPzUs3vNrFm7nKhxKFjnTzEmMoo2AYczsHRBpe",
    id: 1122232,
  },
  {
    generationHash: "ooTYjrtSrE5mmPDfTQDDwo7pAUeCGe24hkY8gLfdwza22cbLSkP",
    id: 1122231,
  },
  {
    generationHash: "oouibjGio1emKUo6FiAsPhr2NMT3UMrtnr7ByyWG19unNhH223H",
    id: 1122230,
  },
  {
    generationHash: "ooxHeToXZvZwy8sCthPft91GCcfPrRZRvwQufZFv7Z3bSGECx3w",
    id: 1122229,
  },
  {
    generationHash: "op15Y4dG7Fbs6nKvp4ykNmEEk8mN1gV3bogBKayB71oQoygwv76",
    id: 1122228,
  },
  {
    generationHash: "oozXarWdShytG2EGJjJv8KV3464mZiPS9BB9zLCKmB79NGRnp2o",
    id: 1122227,
  },
  {
    generationHash: "oomK1syTbrNXfd4AQaBr8AhyrrzR2NwriLS8EceJmH9kUHW4b9h",
    id: 1122226,
  },
  {
    generationHash: "onur4NbLKyE381owX2SHBJo9YVngWXATHY45FGeomkrw6iTPTLQ",
    id: 1122224,
  },
  {
    generationHash: "ooa7Nk8m3anBwixJCHPMACVMXjTMTYCxe9nochhPNchtLnCqXEU",
    id: 1122223,
  },
  {
    generationHash: "ooYRsSCzyvRsqXvvoUa7EQT8vJYoe52w1bCt3B28t4dpX4qzVkV",
    id: 1122222,
  },
  {
    generationHash: "onwMgLPUax9UoQqGwXu2CxwJppVkj6r4PP7uNBSip2btJSkwXQA",
    id: 1122221,
  },
  {
    generationHash: "opReEphndaPNVwbhCYfVV1and3vjWz59iCKNm7ebW5D4CjERG6e",
    id: 1122220,
  },
  {
    generationHash: "ooXKWvVvyqQ7mBqi8bXdryCMmVfQ1wpbKS5G9TfNdPTBu2zUPXj",
    id: 1122219,
  },
  {
    generationHash: "ooRmsyW2L3L6J5a18adDs1TmrQAdTmH9LsjKy1nDCVqvDZ2UNhy",
    id: 1122218,
  },
  {
    generationHash: "onyCryu2CFnAFhK6RKVYqwzQE1hW9S3xtRyadkEigFgagyUV4Rf",
    id: 1122217,
  },
  {
    generationHash: "onwHPbC96h3kCbFbNTSQJSYhHaaykbzKc5xdCKis4SVQKDSjuob",
    id: 1122216,
  },
  {
    generationHash: "onn4CGkUAUaB7NjqbqUBanGWBR6UDtDLzpNyxAki4tSEuSRrcxH",
    id: 1122215,
  },
  {
    generationHash: "opFXhPxq869cSBfqsTBdau1NPHdU59eehDxvHKVMvBFiN61m65J",
    id: 1122214,
  },
  {
    generationHash: "opHG6fhpNmFt6zcfzrFrWQczHrCxEgZPtdhQgg9sTwVcNnQqpR7",
    id: 1122213,
  },
  {
    generationHash: "oo1rCPPR4pETHwdbuTw5LvrvZXTheYNZnzKsnXVEVzL82shgBWb",
    id: 1122212,
  },
  {
    generationHash: "ook2ktZXpHMVCDeJ8d2TiRuELuGD9vtmG3PgPAvYhSEmAXjL5vW",
    id: 1122211,
  },
  {
    generationHash: "opUHFcHb1JA7Pmb7EuuNDgKmBxRN9JtkMLVSW9zQTpmYBcuGeSh",
    id: 1122210,
  },
  {
    generationHash: "opBa5Pbs5JnwzWVq5mu7f7JxqTqpKi5JdNotP9jMGvENgFwnP1g",
    id: 1122209,
  },
  {
    generationHash: "ooNBEHDmmX8m3d5ZE5t3oXYtvAQLWQvDnUeWJv1oe16QkPnExFD",
    id: 1122208,
  },
  {
    generationHash: "oowRcfgDQWkT86MCoApUPgEYKsjoHP2hnEKk6tR5gdzcJ3MBC2i",
    id: 1122207,
  },
  {
    generationHash: "opK4TcDMBUaJXEmks4GBXntGwxi8sPVi6MCj8RYLvZESUz2a1WE",
    id: 1122206,
  },
  {
    generationHash: "oovWdyQ12KbjmXcYK9qzYiRHqFbwoYPc1THpjs49F3sU8aaT6Ex",
    id: 1122205,
  },
  {
    generationHash: "onk234rWsauq18CHYzNhqvKbbFjqNFBQtoTtcQoVbhrQJUyJtnN",
    id: 1122204,
  },
  {
    generationHash: "oo7BPLDih9aHwm6RjnrtvecmuFhfQBrKXNfh4cve2cjTsX6TWip",
    id: 1122203,
  },
  {
    generationHash: "opXcberD4d7wRvSr6cJaFXTmuJz9NKAsDe2rXTGhDNXzWNEBYtg",
    id: 1122202,
  },
  {
    generationHash: "ooX3nJij7tV56MuY2mDWdXFhkYKbmThYEphcNHm2EuJbxnuRxhP",
    id: 1122201,
  },
  {
    generationHash: "opTTPKxSGscBC1Ka9cTV7bP9PnNhEdRSsAWvqKwUSm3rrTDPH12",
    id: 1122200,
  },
  {
    generationHash: "ooTFhSWb1jKZjyKSWNvDPxMybwjNA8jvcZySawmSVLN5dpv1uhg",
    id: 1122199,
  },
  {
    generationHash: "oneTuNGqAA1DGeSsE2p5ZmYCfcMFRg38UvEgq46kzpz2y1GREdj",
    id: 1122198,
  },
  {
    generationHash: "opMTdQp1deTVcHfebTvbPMRXiFnEk9yWm3kQpVKDkedR1zWwVcw",
    id: 1122197,
  },
  {
    generationHash: "oo62tnCjwpexnntsyveED8Y4YfGWGnvRhwvArptARV7NUGqGn6A",
    id: 1122196,
  },
  {
    generationHash: "ons41qmg1kBBWNFgXv8LL9jthtFTxL4HiYUJnxPVDBhNsrzWqea",
    id: 1122195,
  },
  {
    generationHash: "oonUWk4PWQyWz39XQcWF8Tip7RJ6LAirPeQD6eYqucowvRPvZ8F",
    id: 1122194,
  },
  {
    generationHash: "oozuva3sD2cw8EbGRV5wYYsq85Zp3qdyb6bUeXYTeh71Mm1tAUN",
    id: 1122193,
  },
  {
    generationHash: "opTuWEdSnez2h42QevbuzJy6ajMAoRNWPeig6hoAcQ5MpiXB8Zj",
    id: 1122192,
  },
  {
    generationHash: "onxhMVZqWanzmLw5JPVKXpS3wrh2h4R8mfzDsktLcFg7A2whWTf",
    id: 1122191,
  },
  {
    generationHash: "onsamReyJxaGzjFQrWxmdj323T47RS2U8PRLczdKy7oQWH5wmxh",
    id: 1122190,
  },
  {
    generationHash: "oo7wYQrQFagNKNNeq7B57ZVMTWbLAZhahoDTgaWY8aGhhnAhEkd",
    id: 1122189,
  },
  {
    generationHash: "ootrVcNut9Y2avXEs6Ax3Ry53wovUMxk4U8qpeshK3myBcjMVEp",
    id: 1122188,
  },
  {
    generationHash: "ooLsxQ3wFzqU8AnhGmEXy2Ri7DCN4BfNULteq3X9RbguEqbeQV1",
    id: 1122187,
  },
  {
    generationHash: "ooTPb46T6ZKYRCczXjP2tQ4VKpCNzxSQrezVKd4cdUt546RPC7J",
    id: 1122186,
  },
  {
    generationHash: "op6MNKfdFg2Bac17pRKu9WJoH9Mr2Usp3CxFNRgYQRXmxu58eHi",
    id: 1122185,
  },
  {
    generationHash: "opVJ7mAw6pSepTGVSVBJToFumHjTbJGb9ZrBo126JLXGGASjx4N",
    id: 1122184,
  },
  {
    generationHash: "oor1UyZGpoQq5PD6hTtGjMjQCqVJEXLbProCH174xgZAVQHb1nY",
    id: 1122183,
  },
  {
    generationHash: "opTRQkiW5ErJH2QqKZqU2QF9xfv2uKBAi4V6KHS8pwCW6SWfLWd",
    id: 1122182,
  },
  {
    generationHash: "ooctvXLssmWwE7FyhaYTKmSDvZNnFawUu7JVYMxXi1bcy3YvB3t",
    id: 1122181,
  },
  {
    generationHash: "op8jEkuCVn59CdrJzFGxtYBKGcfCwwsY1LfBD2smbKLeXbwJdyV",
    id: 1122180,
  },
  {
    generationHash: "ooosKEC22A6SfQhhHeZRuiL5Q9H8KcE7TjvqNPfVTcyeVQ5NVS5",
    id: 1122179,
  },
  {
    generationHash: "onrPWP2nMxUrptx9zJeAbVStPzrPFRx3dGEZyasW3y3WCUzmcSb",
    id: 1122178,
  },
  {
    generationHash: "onnLuAC1LjGLYeKeDz26SHWNc3FBHqK7LLcCsWbYTqRRoUKUG7d",
    id: 1122177,
  },
  {
    generationHash: "ooryhRPFHGJz34iMSaRzhz3pXbSiw7vtuzEJW1dUx6kSXya1pHr",
    id: 1122176,
  },
  {
    generationHash: "opYZoECKyh51E6TBhjUXxHwKkkEuHBpAoEf2Nt6u7T31ZzJscJe",
    id: 1122175,
  },
  {
    generationHash: "ooRecjReBshAduALxT2bMe253qC6rn9arEuXzVMG2pRhVLbGZFs",
    id: 1122174,
  },
  {
    generationHash: "ookfHghtJ8XZweVMmFfVpg5fdCpHS796ZFWCivRUKirZmw6o2QB",
    id: 1122173,
  },
  {
    generationHash: "opYkou9JbQPoGBZioxB2Bf5tuMravAe1rRh1KfWVijVk5rNGrp3",
    id: 1122172,
  },
  {
    generationHash: "op7xTxqGYyfUAaER9BDKPxxkcGU1JvC2gNDFnhSnP6LsdAgsZSj",
    id: 1122171,
  },
  {
    generationHash: "opUonwTj3BT3DyWbjF27886iYpFCqbaJ7yC7mWrSKTQxhrhcFch",
    id: 1122170,
  },
  {
    generationHash: "onuiCFYEtNSaVqWB6avC9D5CVbWqm5S5ZNrxf2qJ4kTMS1xdxAA",
    id: 1122169,
  },
  {
    generationHash: "ooNRc5FPR8QDjQVMfYuHVqwXUDAdJLYixEExGUZJNANzyB5pAor",
    id: 1122168,
  },
  {
    generationHash: "ooDHxcwSUmKHR8jV5wK9g5Cpc75CL9yVugdXLcGexQjfVz43zG3",
    id: 1122167,
  },
  {
    generationHash: "opDVUENUtwxG2H86jhmY5xZVcp413VgM26txC1r2mvvpxWdMYVx",
    id: 1122166,
  },
  {
    generationHash: "onvpcJrKvDNEBqYbRPBdWLrvWzYnkH85BNtw5ibtLEiUkBENtWt",
    id: 1122165,
  },
  {
    generationHash: "oo4WdwjdXoZiuEh1BH2YYm4knf8QCWUwnzqbvuw5MrbbUJ4z3wr",
    id: 1122164,
  },
  {
    generationHash: "opFyRJ8eubdAQtF72w9sR1tChXmUdwbqsHjjn79kpCUufuurX7K",
    id: 1122163,
  },
  {
    generationHash: "op3XwcoWb1oGcxeUY9Z9m72XNcaF4DG8KDBCALKfeGFPddpU4bi",
    id: 1122162,
  },
  {
    generationHash: "op3StrPN7Mub8mF4LdXi8u1CrfN7YgCMGyMaddxLrvfF7LTZHgq",
    id: 1122161,
  },
  {
    generationHash: "ontGWffKiJochCD7SYPjwLdjvgcM5vRjozQybfzXgW4puhZjPWH",
    id: 1122160,
  },
  {
    generationHash: "onsWPu1dobD1DP5gDPmyYTmyANDW5rCbiCmsnnwEVc8VNzxWYBU",
    id: 1122159,
  },
  {
    generationHash: "ooH8DyRVzBhTVxuZ77DqpDEHNCp22Tb6TQfZWYR4aVQd1KYEWVw",
    id: 1122158,
  },
  {
    generationHash: "op4pQrur3cQeAQqm1cGQW8K6cxfptQyHbKaL4sX4QgeY455yp9U",
    id: 1122157,
  },
  {
    generationHash: "opVS7fqBeAQK1bKMTJSLHzL5YxMrdNc7uATugtbv6zL33SuPewZ",
    id: 1122156,
  },
  {
    generationHash: "oo3Ne8LeAnSxJNadTW9Q3QkWMYipsz2DVPRQDtufSFqAogo5WVu",
    id: 1122155,
  },
  {
    generationHash: "oo29o9Yshv8E9ScUiKXrcoVdNduvcb2rMMWxCRNiRPbZneS9tfp",
    id: 1122154,
  },
  {
    generationHash: "oooSPR9EqH15x8GxcJkeY51XM6oW5kqU9d61KCwTn2dmDEK7KFb",
    id: 1122153,
  },
  {
    generationHash: "opSQf7YiT6AmgSiGAp24GBMMyV93srSBcDGie4RzdaMUopZyn5Q",
    id: 1122152,
  },
  {
    generationHash: "ooxL1a4aJyKz7Y2pvW4MwpiYekyyaGxA45tsPgkrFqZNUmWasSU",
    id: 1122151,
  },
  {
    generationHash: "oox8gqJmUAwjizFxQtnzZZ67Uo1GzLnHkoygvYBB5e4gWFKhPHj",
    id: 1122150,
  },
  {
    generationHash: "oo74yNw2zeRCTTNLWoyp9ZpoJ3aygk79nEfYEv4QtwSWDyrRhoB",
    id: 1122149,
  },
  {
    generationHash: "oomvaZcAivQgBzAqkLREsWWaaac7Y1cxg2SnAdBjr21kp4z4TUD",
    id: 1122148,
  },
  {
    generationHash: "ooL8LchYrj3V7wSKY6NdM1BZ61Htbtj2UZCNYsPeyBDJQuk3PqJ",
    id: 1122147,
  },
  {
    generationHash: "ooGzMUUEqB4yvUvnUKWNPqPub2qX1tvmyP56H85BimAwvFvMZSF",
    id: 1122146,
  },
  {
    generationHash: "opPDebkY6ETCXeTRKgYtUsYB29mnAiGV3NfGvCZ6d5w7g9SFe7i",
    id: 1122145,
  },
  {
    generationHash: "oo14RCiQavNffrLqk28Pb4ZiDhtWCuQSGv8nKbYwpNLy7RbTzDj",
    id: 1122144,
  },
  {
    generationHash: "onrsR4EbMrJeTKscQhjXxsd6VSZdnNHWyvDhP5YrYfv3xR8mB5c",
    id: 1122143,
  },
  {
    generationHash: "opRWJW1cEkJUnRTpLRWtD5L9kaKdR6rmBkbz86MSsEVJFHLgKc4",
    id: 1122142,
  },
  {
    generationHash: "opVmsAAaZbuCGmHo8kXsmCze2nu3QQKsnUwRqrwMtzmCuS6wDA8",
    id: 1122141,
  },
  {
    generationHash: "ont5FGkk25RZn4qeNJ6H3howeFhjMr561ZAdsiM367fbowTGvSy",
    id: 1122140,
  },
  {
    generationHash: "oneHkYGe4jg8zwU7eHAomYNPxiRLDXS1pCRevasa9Gb4tWTw7Tk",
    id: 1122139,
  },
  {
    generationHash: "op4SWUHGw9hXSzwgLE9ajVRZXFKYVoNkkuENzbb1MRqt9KvJYA1",
    id: 1122138,
  },
  {
    generationHash: "opEfrUBRJ5hdV9h5BKanB4S7PfWM429uaoYyUyjhjuNMM2ySrJS",
    id: 1122137,
  },
  {
    generationHash: "opPL8bkjVJQtyfLQLrVqbnctqk6Ect7uBZGjXCFSTsXSp2GkgRL",
    id: 1122136,
  },
  {
    generationHash: "opLvnwj8R2MkFWSye2ZNta3KzM5eVFLJ2YkENRKt9QZntEsienk",
    id: 1122135,
  },
  {
    generationHash: "oo4RnJ8rSJPRuxwvkd46JGxQrinYK6dz8NG2kKyhUtRsxo6C8ft",
    id: 1122134,
  },
  {
    generationHash: "ooWruqiYBMVERrh7RRKMNRyPpAKFaBMjDcYC2qocqMGZKotN2EL",
    id: 1122133,
  },
  {
    generationHash: "op9CGp82rrwzuuPR1jq8m6hgFdJ4HNEjvaF6qooqWAKAHbXxfug",
    id: 1122132,
  },
  {
    generationHash: "ooUDFJ5XwabfqkoU2xEFM6ATtsqngz2RtaaWBZMEjhiMG6CbfF6",
    id: 1122131,
  },
  {
    generationHash: "ooVeBo5836BjBL4UyMAXzCqtdQztoJbiUBkSioTBNgktBniFHZi",
    id: 1122130,
  },
  {
    generationHash: "onxsyi5uGLVSVFJPTWvwQjGj4efN6YLpTcXusS1AmQknRYiRHiS",
    id: 1122129,
  },
  {
    generationHash: "oooD5oQHmKNza6XZdLbLTzyMSPMCedehq8BgdsZ42XAdSm2GvRJ",
    id: 1122128,
  },
  {
    generationHash: "opFD9U58fm9m8EkNjEbimE7x4GxDiEbG6RPFVRqKbjeF4wsoD2A",
    id: 1122127,
  },
  {
    generationHash: "opDzHuMCx2pqXB9uBV494x5J5RSTTTPZdNqZtiyfY3oCUwmeCqH",
    id: 1122126,
  },
  {
    generationHash: "oo2rKxEgsNPFNBQqywDjn16Lf2AYMG6mD2kAtZwHgsUVzLxyi4c",
    id: 1122125,
  },
  {
    generationHash: "onuGTbVUTnTZsKRg3fjrfn2QcTZ4evP4BXV8TSM7Qpr9SN5NeNs",
    id: 1122124,
  },
  {
    generationHash: "opCASoCavbF572kmndjyC6S7uWHf9w5aDake7SWWLETamBWS5QS",
    id: 1122123,
  },
  {
    generationHash: "onssrAo9JyEQhGCbG2hR3XJrT83mbcqLUhtJW734f1p79NPfdfF",
    id: 1122122,
  },
  {
    generationHash: "ooCLZ7juRmY884s4pWmUyH5DTZeG8aVgWNVvm6mrXjWK8eAdJas",
    id: 1122121,
  },
  {
    generationHash: "ookJMfbdEeWxV3vVkgNg25NUPvjzqpG8CmbPkCUFvMJDu1ix716",
    id: 1122120,
  },
  {
    generationHash: "ooHBHEU41VH5fe43B2rVQ1S5WJV6WsWqwMKzgUj2WPzCa7KsPuy",
    id: 1122119,
  },
  {
    generationHash: "oniDdFppxfcWTTihCdTdREitJtHBx3GLRQMYyYqJqaQwM8qpbvC",
    id: 1122118,
  },
  {
    generationHash: "ooVRdJqFBb2EHK1Tfi8v1Pf9XkwNWvXBSVq5pMn95cfyFXAS8bs",
    id: 1122117,
  },
  {
    generationHash: "opUJayk2PtgpTZC9zyqDMoyzCfHg6XLHqmdB1w4QiFYzrQSKrnU",
    id: 1122116,
  },
  {
    generationHash: "onk6ztbLa2QSoVN5DhQzdyS4Xjc7if7qj8zkttaxTrUdPYCxskg",
    id: 1122114,
  },
  {
    generationHash: "onvr5hETzyoYYKT1zU9w2ykWPfGYUErjKSdsq3oRdHj4T61hVU7",
    id: 1122113,
  },
  {
    generationHash: "opMMyBvU9reeuxmqu8tmkHxwWBPaB6L4PBrLjNghXkYNAQEiS26",
    id: 1122112,
  },
  {
    generationHash: "ooW53cFhQutbQc25Vbibn6rgE5U5QBmDG6ekZAgNTFYFPwJJ3zp",
    id: 1122111,
  },
  {
    generationHash: "oohgBnmY88AhFgGQ4NDHSVhVx8vp5dxJ8FuX5V5EfS4YMFNg8yc",
    id: 1122110,
  },
  {
    generationHash: "oobxQuMYLmKYBVcUgB6MiEzWhHthHMXyfNT6TpMSZf9c9gt1kNK",
    id: 1122109,
  },
  {
    generationHash: "opQjPmA61iefd6nkHDLwNQQeSGyFUZM3mD4djDebTmETN59y8FE",
    id: 1122108,
  },
  {
    generationHash: "oojVQEAgHpbCD9jJM8hTVYifoKZuatoFeXnCfgUzruZ9hrEwPoW",
    id: 1122107,
  },
  {
    generationHash: "op3JFL39v4m8sC2sVbHokPszHb9cQwhQ9cRMpz7ThjCPECoLJXw",
    id: 1122106,
  },
  {
    generationHash: "oo3HE7Le6NcWyczDXjncGhF4MwYo7RSxyR1SSx5koMuhgThc3ak",
    id: 1122105,
  },
  {
    generationHash: "oo58R4jEXHtNa9xiBb5mWzd8z6vwK1vYDgcDeJKTDY9zdsv5EgM",
    id: 1122104,
  },
  {
    generationHash: "oozE3Po3i5zqxkLJ6oXhyZmDtvBHS2rG34EUFAczGAjNH9arj5F",
    id: 1122103,
  },
  {
    generationHash: "oo8fCCGULyFmgspRTZhiqpSyaQoURXVH2LqxWD9dQUF5p9D5gKf",
    id: 1122102,
  },
  {
    generationHash: "oofhPpxUCDyhwfHCybcS5SAQcur6Y8wgxCrzJRFPJ9ZWdHwZMvK",
    id: 1122101,
  },
  {
    generationHash: "opQg7nDVgWeoyJ7aiBkPgFVnfsZwBZRESATKgCG3UzYAcpBb41L",
    id: 1122100,
  },
  {
    generationHash: "op5kBR8iCCLgBt7v6ktgJPG5qULaGGp9N8NBp3MsXx7dkTLuUp1",
    id: 1122099,
  },
  {
    generationHash: "opE1jk7jrRA9dteUYskzvi4arS1g8TBbXi56kqQgyDNBgaYCR8G",
    id: 1122098,
  },
  {
    generationHash: "ookNsXf5Ltf4GEitjV2YHyFqiHsPJE3Md16swNtbXfvYLTVPh6T",
    id: 1122097,
  },
  {
    generationHash: "opRKJTJJU5c2gRw8MQ6oHRBVdcvGdjMFfVAZDhgvZ1RoSmP2ri5",
    id: 1122096,
  },
  {
    generationHash: "oopgBcujd8evHWY9zu7h1njCCMMtMPeDTXnPnssorPLMHYW1x9b",
    id: 1122095,
  },
  {
    generationHash: "onnUbrSMqPZa2ZyH5fMbRSfXGfSS7bdWGHhzYfX9RVNnsN2uyUr",
    id: 1122094,
  },
  {
    generationHash: "onkUdfkpdsYU8CcWacxS9SBwkzs1EVBvwCrYNWAgMe8dYW373iE",
    id: 1122093,
  },
  {
    generationHash: "ooSJCrAq7rqDF3iTuid8guf2uuxndpD1ugC1vGABfxApfcXmdvB",
    id: 1122092,
  },
  {
    generationHash: "oo7BQgLXVJBvrQkXzQN1ojAZwzR3hicidivZYHKbyg2kh81K8eH",
    id: 1122091,
  },
  {
    generationHash: "ooqaad6ATKwSyVoofPp8nL3JrPEk6y4TjpaFhC5mUrVPm6Cyjwp",
    id: 1122090,
  },
  {
    generationHash: "ooYnDLe8iRjFPgehhMWdAHc7dE2Y7cmHW1SNP95Zgve8stUDtbu",
    id: 1122089,
  },
  {
    generationHash: "oo1v6gUKEnkwRKMV1A2qLorfCSwgHYNnh4qiWuuQjEcrsS3XdAU",
    id: 1122088,
  },
  {
    generationHash: "ononEDiNDkZCS2yzRcN8thfSHtrqRJtfcJhcKVuAP456JVkCsB1",
    id: 1122087,
  },
  {
    generationHash: "ooHdaPQnUHQ1fTVb4f482ifReM1HYPrqz8JRUUjsMTXPP6YNTwV",
    id: 1122086,
  },
  {
    generationHash: "ooqBRibCGu3jpruiXbufYHCh8NZ7cdhEBArBs2HhFhAh9XKxJFv",
    id: 1122085,
  },
  {
    generationHash: "ooNqb3jMzcexQYgs26fyAbivJkfPvbbeK9Tk6coxWrANeYcxus4",
    id: 1122084,
  },
  {
    generationHash: "opHmRLVUx3GbL3UekGUc2puKHA2qsPEVABkt5qYMGUjXr9imkfr",
    id: 1122083,
  },
  {
    generationHash: "ooTWSJ5SNaWdQCTYKDXk67YKrUEf4GeSKRtyNM76u2xJuD22MMa",
    id: 1122082,
  },
  {
    generationHash: "oojPkZCy17njQr5nU98UhPdpG4r9Lg6EQnmAi2QridUq27kvwCX",
    id: 1122081,
  },
  {
    generationHash: "ooihKU6oASjgMvu2Pc88rbNgbppqNvM4yX5b4pCTwbf2QEbomHA",
    id: 1122080,
  },
  {
    generationHash: "onjVh2GuBY8ozg7hrcPkpTLDZz3TMKxTJBZro2wwCRwxv6aVGyC",
    id: 1122079,
  },
  {
    generationHash: "oodqu8Haq8NMFPC38kj6SC2SD2a7cMJCgpBrks3jTVkJSP4SEkW",
    id: 1122078,
  },
  {
    generationHash: "oojuQgkV31aRa8VDLPMaRo1qw3Zr6bCPcX956a1sDta5H2d8hYH",
    id: 1122077,
  },
  {
    generationHash: "oovNUTaZx2KAmdphiY3vpWVXUH5R3tsFaUn7kbB2zf8EJmf7raj",
    id: 1122076,
  },
  {
    generationHash: "ooHY8WqRW4MLtXmoB7wHkmTAKu2ADjn6oYMJjFqxdMRyBWBFQUe",
    id: 1122075,
  },
  {
    generationHash: "oomK7NpsAhY1pBaAnoSP3PV8eQrv9MqM6j75fdmgwreCUxxspDm",
    id: 1122074,
  },
  {
    generationHash: "oo1XeiCKLpRst1Rq9XzyZFvSqo3EYdT71iqDgA2cCoPoJ8Fq7rn",
    id: 1122073,
  },
  {
    generationHash: "ooPmVmbdrgotD6GzMgS1QDyuzbJ87aSCyfUYxvxD8sdsMj46dUd",
    id: 1122072,
  },
  {
    generationHash: "ooPtjjYqj26MBrVnD1qXckHsjDnYnyphXsnZQfUDCwknRMiZH4t",
    id: 1122071,
  },
  {
    generationHash: "ooPhXkVqdeyw8oHmdHmmYNRkcQCCNnHwyzUdmSuoHLKm7xVAzzW",
    id: 1122070,
  },
  {
    generationHash: "opYGAAQDjmahe486u5niJZ7r2B72yWKvEhMApeJk1BXyL63mpHN",
    id: 1122069,
  },
  {
    generationHash: "onpqMqJ394FXxUWcpVYyPWYthPpBF6VxSfid6C8i5j9e5RL2Qbf",
    id: 1122068,
  },
  {
    generationHash: "ooMgB5VJq8GzaKxizZuLwTCQnDsP1ZqvgFkMA4qU8icmZ3LiSfk",
    id: 1122067,
  },
  {
    generationHash: "ooEKAbk41iHT8RUsb4Ac5AnRJz2eybiyFvjDB2NMqVsKRLa5ciM",
    id: 1122066,
  },
  {
    generationHash: "oo85NDRBoXyhaQog3FGNmau5g6m5doAbCMEPEdHMjyx7t2LGUUj",
    id: 1122065,
  },
  {
    generationHash: "opVCG4m2iFxY3LZ11JXLnpxvveugGEmAJsBJktgQXaE74PzCGvc",
    id: 1122064,
  },
  {
    generationHash: "ooxFPo7RbRkDfpsd14UkN3cBerZMHSywtetBKs8usMNdB6d268v",
    id: 1122063,
  },
  {
    generationHash: "oocNx6fKEbaR1NzgAzNaqAuYYFGU9T6cA9Dhze5VBcTi8g5b8vK",
    id: 1122062,
  },
  {
    generationHash: "oneYfFCaGBXrhZrBbH7YX9gC6N8vEaPoSkk7w8eg5WRWPmfvZNy",
    id: 1122061,
  },
  {
    generationHash: "ooiFvufXhbG66WeLBeWo7mYngdsNN4o53hNWR9uRBzaKUPdPMH1",
    id: 1122060,
  },
  {
    generationHash: "onjqaFuuhgTga5yksxYEBhneE4em7F9LtwB96UfEdWubtMFBiVG",
    id: 1122059,
  },
  {
    generationHash: "ooMHF3aQudSHexBmeLNyuvV1J6CJBKA71q6YBAvDzud7uta3F9h",
    id: 1122058,
  },
  {
    generationHash: "opVC5PQDNPxaX47VPqR2cHo7Yi5oiYb3Xo3zsApXGKuJ5Yng6v9",
    id: 1122057,
  },
  {
    generationHash: "oo7YYJA4xkCzCQttye2rHdmMViF3qwASdUMyxY4kmqkL92Ebif9",
    id: 1122056,
  },
  {
    generationHash: "opDfvC9L5Vi6hrZSP4btCHN6b8JjW8EC1chja4MCm6w5rX8LdBj",
    id: 1122055,
  },
].reverse();

const animate = true;
const save = false;

const firstPaletteColors = {
  darkBlue: Color(214 / 360, 0.56, 0.5),
  greyBlue: Color(178 / 360, 0.15, 0.65),
  red: Color(5 / 360, 0.6, 0.92),
  yellow: Color(41 / 360, 0.64, 1),
  beige: Color(37 / 360, 0.17, 0.99), // this one must be last for psychedelic
};

const white = Color(0, 0, 0.99);
const black = Color(0, 0, 0.23);
let blackAndWhitePalette = [white, black];

let defaultTimeToDraw = 4000;
let timeToDraw = defaultTimeToDraw;
let timeAuto = true;
function getTimeToDraw() {
  return timeToDraw;
}

canvasJp(
  document.querySelector("#container") as HTMLElement,
  function* (random, { width, height }) {
    const margin = width / 10;
    const waveMargin = width / 16;

    const palette = random.pick([Object.values(firstPaletteColors)]);

    const mode = random.pick(new Array(80).fill("Normal").concat(["Tiny"]));

    // Elements variables
    let numberOfElements = Math.ceil(
      mapRange(Math.pow(random.value(), 2.5), 0, 1, 500, 800)
    );
    if (mode === "Tiny") {
      numberOfElements *= 3;
    }
    let initialWidth =
      mode === "Tiny"
        ? mapRange(random.value(), 0, 1, width / 150, width / 200)
        : mapRange(
            Math.pow(random.value(), 1.25),
            0,
            1,
            width / 85,
            width / 55
          );

    let length = clamp(
      initialWidth * 1,
      initialWidth * 30,
      random.gaussian(initialWidth * 16, initialWidth * 5)
    );
    if (length < initialWidth * 3 && random.value() > 0.1) {
      length *= 3;
    }
    const placement = random.pick([
      placeElementCircle,
      placeElementCircle,
      placeElementCircle,
      placeElementCircle,
      placeElementCircle,
      placeElementCircle,
      placeElementCircle,
      placeElementCircle,
      placeElementWave,
      placeElementWave,
      placeElementRandom,
      placeElementGrid,
      placeElementGrid,
    ]);

    if (placement === placeElementWave) {
      numberOfElements *= 0.6;
    }

    // Deformation of the positions. If everything is at 0, it should be a
    // perfect circle
    let flowFieldZoom = mapRange(random.value(), 0, 1, width / 2, width);
    const deformationClamp = 0.6;
    let circleDeformationStrength = clamp(
      deformationClamp,
      Number.MAX_SAFE_INTEGER,
      random.value() < 0.02
        ? mapRange(Math.pow(random.value(), 0.3), 0, 1, 2, 10)
        : mode === "Tiny"
        ? mapRange(Math.pow(random.value(), 1.5), 0, 1, 0.4, 4)
        : mapRange(Math.pow(random.value(), 1.5), 0, 1, 0.4, 2.8)
    );

    if (circleDeformationStrength === deformationClamp) {
      circleDeformationStrength = mapRange(random.value(), 0, 1, 0, 0.1);
    }
    if (circleDeformationStrength > 1.5) {
      numberOfElements *= 0.8;
    }

    const shouldUseFlatDirection = [
      placeElementCircle,
      placeElementGrid,
    ].includes(placement);
    const directionFunction = random.pick(
      new Array<
        (
          initialPosition: CanvasJpPoint,
          usedCenter: CanvasJpPoint,
          startPoint: CanvasJpPoint
        ) => number
      >()
        .concat(
          new Array(shouldUseFlatDirection ? 75 : 150).fill(directionConcentric)
        )
        .concat(
          shouldUseFlatDirection
            ? new Array<typeof directionFlat>(
                circleDeformationStrength > 1 ? 45 : 6
              ).fill(directionFlat)
            : []
        )
        .concat(placement === placeElementGrid ? [] : [directionFlowField])
        .concat(directionRandom)
        .filter(Boolean)
    );

    if (directionFunction === directionRandom && length > initialWidth * 6) {
      initialWidth *= 2.5;
      length = Math.min(
        length / 1.5,
        initialWidth * mapRange(random.value(), 0, 1, 2, 4)
      );
    }

    if (directionFunction === directionRandom && numberOfElements > 500) {
      numberOfElements *= 0.6;
    }

    let latestComputedDirectionPosition: CanvasJpPoint | null = null;
    let latestDirectionOffset: number | null = null;
    function directionRandom(
      initialPosition: CanvasJpPoint,
      usedCenter: CanvasJpPoint,
      startPoint: CanvasJpPoint
    ) {
      if (latestComputedDirectionPosition !== startPoint) {
        latestComputedDirectionPosition = startPoint;
        latestDirectionOffset = distance(usedCenter, startPoint) * 0.004;
      }
      let offset = latestDirectionOffset as number;
      return (
        random.noise2D(
          offset + distance(initialPosition, startPoint) * 0.002,
          offset
        ) * Math.PI
      );
    }
    directionRandom.fxname = "Random";

    const sinusoidalDeformationFrequence = mapRange(
      random.value(),
      0,
      1,
      20,
      30
    );
    const sinusoidalDeformationStrength =
      directionFunction === directionFlat && random.value() > 0.5
        ? mapRange(random.value(), 0, 1, 0.06, 0.1)
        : 0;

    if (sinusoidalDeformationStrength > 0) {
      circleDeformationStrength *= 0.7;
    }

    // Control over the colors
    // Gradient precision defines how smooth the gradient should be.
    const gradientPrecision = mapRange(
      Math.pow(random.value(), 18),
      0,
      1,
      0.8,
      circleDeformationStrength > 1
        ? 4
        : sinusoidalDeformationStrength > 0
        ? 1
        : 12
    );
    if (gradientPrecision > 7) {
      length *= 1.5;
    }

    const gradientRoughness = mapRange(
      Math.pow(random.value(), 3),
      0,
      1,
      0,
      0.17
    );

    const colorMixer = random.pick(
      new Array<typeof Color.mix>()
        .concat(new Array(10).fill(Color.mix))
        .concat(new Array(10).fill(oppositeMix))
        .concat(
          gradientPrecision < 1 &&
            circleDeformationStrength < 1.5 &&
            sinusoidalDeformationStrength === 0 &&
            directionFunction !== directionRandom
            ? [randomMix]
            : []
        )
    );

    function blackAndWhite() {
      const mainColor = random.pick(blackAndWhitePalette);
      const secondColor = random.pick(
        blackAndWhitePalette.filter((color) => color !== mainColor)
      );
      return {
        name: "black&white",
        getBackgroundColor: () => mainColor,
        getMainColor: () => mainColor,
        getSecondColor: (mainColor: CanvasJpColorHsv) => secondColor,
      };
    }
    blackAndWhite.fxname = "Black & White";

    const excludedPalettes = [
      {
        mixer: oppositeMix,
        mainColor: firstPaletteColors.red,
        excludedChoices: [
          firstPaletteColors.greyBlue,
          firstPaletteColors.darkBlue,
        ],
      },
      {
        mixer: oppositeMix,
        mainColor: firstPaletteColors.yellow,
        excludedChoices: [firstPaletteColors.greyBlue],
      },
      {
        mainColor: firstPaletteColors.yellow,
        excludedChoices: [firstPaletteColors.beige],
      },
      {
        mixer: oppositeMix,
        mainColor: firstPaletteColors.greyBlue,
        excludedChoices: [
          firstPaletteColors.red,
          firstPaletteColors.yellow,
          firstPaletteColors.beige,
        ],
      },
      {
        mixer: Color.mix,
        mainColor: firstPaletteColors.greyBlue,
        excludedChoices: [firstPaletteColors.red],
      },
      {
        mixer: Color.mix,
        mainColor: firstPaletteColors.red,
        excludedChoices: [
          firstPaletteColors.greyBlue,
          firstPaletteColors.yellow,
          firstPaletteColors.darkBlue,
        ],
      },
    ].filter(({ mixer }) => !mixer || colorMixer === mixer);

    function getRemainingPalette(mainColor: CanvasJpColorHsv) {
      const excludedColors =
        excludedPalettes.find((item) => item.mainColor === mainColor)
          ?.excludedChoices || [];
      return palette
        .filter((color) => excludedColors.every((item) => item !== color))
        .filter((color) => color !== mainColor);
    }

    function dual() {
      const mainColor = random.pick(
        palette.filter((color) => getRemainingPalette(color).length > 0)
      );
      const remainingColors = getRemainingPalette(mainColor);
      const mainSecondColor = random.pick(remainingColors);
      const amountOfMainSecondColor = Math.round(random.gaussian(6, 1.5));

      const glitchBaseColor = random.pick([white, black, black, black]);

      const dualGlitchColor = Color.mix(
        Color(
          (mainColor.h + mainSecondColor.h) / 2,
          glitchBaseColor.s,
          glitchBaseColor.v
        ),
        mainColor,
        0.9
      );

      const secondColors = new Array(amountOfMainSecondColor)
        .fill(mainSecondColor)
        .concat([
          amountOfMainSecondColor > 7 && random.value() > 0.05
            ? random.pick(
                remainingColors.filter((color) => color !== mainSecondColor)
              )
            : null,
        ]);

      return {
        name: "monochrome",
        getBackgroundColor: () => mainColor,
        getProgressBarColor: () => mainSecondColor,
        getMainColor: () => mainColor,
        getSecondColor: (mainColor: CanvasJpColorHsv, progress) =>
          progress < 0.8 ? random.pick(secondColors) : mainSecondColor,
        getGlitchColor: () => dualGlitchColor,
      };
    }
    dual.fxname = "Dual";

    function multicolor() {
      const mainColor = random.pick(palette);
      return {
        name: "multicolor",
        getBackgroundColor: () => mainColor,
        getMainColor: () => mainColor,
        getSecondColor: (mainColor: CanvasJpColorHsv) =>
          random.pick(palette.filter((color) => color !== mainColor)),
      };
    }
    multicolor.fxname = "Multicolor";

    const darkBackground = Color(270 / 360, 0.53, 0.1);

    function multicolorDarkBackground() {
      const mainColor = darkBackground;
      return {
        name: "multicolor",
        getBackgroundColor: () => mainColor,
        getMainColor: () => mainColor,
        getSecondColor: (mainColor: CanvasJpColorHsv) =>
          random.pick(palette.filter((color) => color !== mainColor)),
      };
    }

    multicolorDarkBackground.fxname = "Dark";

    function psychedelic() {
      return {
        name: "psychedelic",
        getBackgroundColor: () => palette[palette.length - 1],
        getMainColor: () => random.pick(palette),
        getSecondColor: (mainColor: CanvasJpColorHsv) =>
          random.pick(palette.filter((color) => color !== mainColor)),
      };
    }

    psychedelic.fxname = "Psychedelic";

    function psychedelicDark() {
      return {
        name: "psychedelic",
        getBackgroundColor: () => darkBackground,
        getMainColor: () => random.pick(palette),
        getSecondColor: (mainColor: CanvasJpColorHsv) =>
          random.pick(palette.filter((color) => color !== mainColor)),
      };
    }
    psychedelicDark.fxname = "Dark Psychedelic";

    const colorPickerFactory =
      colorMixer === randomMix
        ? psychedelic
        : random.pick(
            new Array<typeof multicolor>()
              .concat(blackAndWhite)
              // .concat(new Array(4).fill(monochrome))
              .concat(new Array(6).fill(dual))
              .concat(new Array(16).fill(multicolor))
              .concat(new Array(1).fill(multicolorDarkBackground))
              .concat(psychedelic)
              .concat(psychedelic)
              .concat(psychedelicDark)
          );

    const colorPicker = colorPickerFactory();
    const backgroundColor = colorPicker.getBackgroundColor();
    const hasNoGradient = random.value() < 0.05;

    const hasReversedColorDirection = random.value() > 0.8;
    const colorLinearity = mapRange(random.value(), 0, 1, 0.6, 1);

    const isDarkBackground = [
      psychedelicDark,
      multicolorDarkBackground,
    ].includes(colorPickerFactory);
    const threshold = isDarkBackground ? 0.4 : 0.2;

    Color.mix.fxname = "Default";

    function oppositeMix(
      colorA: CanvasJpColorHsv,
      colorB: CanvasJpColorHsv,
      factor: number
    ) {
      let hueA = colorA.h;
      let hueB = colorB.h;
      if (hueA - hueB > threshold) {
        hueB += 1;
      } else if (hueB - hueA > threshold) {
        hueA += 1;
      }
      return Color(
        (hueA * factor + hueB * (1 - factor)) % 1,
        colorA.s * factor + colorB.s * (1 - factor),
        colorA.v * factor + colorB.v * (1 - factor)
      );
    }
    oppositeMix.fxname = "Opposite";

    function randomMix(
      colorA: CanvasJpColorHsv,
      colorB: CanvasJpColorHsv,
      factor: number
    ) {
      return random.pick([Color.mix, oppositeMix])(colorA, colorB, factor);
    }
    randomMix.fxname = "Glitch";

    const colorMixerAmplified = (colorA, colorB, factor) => {
      const factorAmplified = Math.pow(
        factor,
        hasReversedColorDirection ? colorLinearity : 1 / colorLinearity
      );
      return colorMixer(colorA, colorB, factorAmplified);
    };

    const colorDirection = hasReversedColorDirection
      ? (progress) => progress
      : (progress) => 1 - progress;

    const hasVariableSize = random.value() < 0.03;

    const transformElement = random.pick(
      new Array(25)
        .fill(identity)
        .concat(
          new Array(15).fill(
            sinusoidalDeformationStrength < 0.05 &&
              gradientPrecision < 1.5 &&
              gradientRoughness < 0.04
              ? tranformShape
              : null
          )
        )
        .concat(
          new Array(3)
            .fill([
              random.value() < 0.2 &&
              circleDeformationStrength < 2 &&
              placement !== placeElementRandom
                ? symmetry
                : null,

              line,

              sinusoidalDeformationStrength < 0.05 &&
              gradientPrecision < 1.5 &&
              colorMixer !== randomMix &&
              length / 3 > initialWidth
                ? stripe
                : null,

              circleDeformationStrength < 0.7 &&
              length > initialWidth * 5 &&
              sinusoidalDeformationStrength === 0 &&
              !hasNoGradient
                ? transformClouds
                : null,
            ])
            .flat()
        )
        .concat([transformBorder])
        .filter(Boolean)
    );

    if (transformElement === symmetry) {
      numberOfElements /= 4;
    } else if (transformElement === stripe) {
      if (length < width / 10 || length < initialWidth * 8) {
        length = clamp(
          initialWidth * 12,
          initialWidth * 30,
          random.gaussian(initialWidth * 16, initialWidth * 5)
        );
      }
    }

    const centerRandom = random.value();
    let center: CanvasJpPoint =
      centerRandom > 0.15
        ? Point(
            mapRange(random.value(), 0, 1, 0.3, 0.7) * width,
            mapRange(random.value(), 0, 1, 0.3, 0.7) * height
          )
        : centerRandom > 0.14
        ? Point(
            mapRange(random.value(), 0, 1, 0, waveMargin),
            mapRange(random.value(), 0, 1, 0, height)
          )
        : centerRandom > 0.13
        ? Point(
            mapRange(random.value(), 0, 1, 0, width),
            mapRange(random.value(), 0, 1, 0, waveMargin)
          )
        : centerRandom > 0.12
        ? Point(
            mapRange(random.value(), 0, 1, width - waveMargin, width),
            mapRange(random.value(), 0, 1, 0, height)
          )
        : centerRandom > 0.11
        ? Point(
            mapRange(random.value(), 0, 1, 0, waveMargin),
            mapRange(random.value(), 0, 1, height - waveMargin, height)
          )
        : Point(width / 2, height / 2);

    let maxDistance =
      Math.max(
        distance(Point(0, 0), center),
        distance(Point(width, 0), center),
        distance(Point(width, height), center),
        distance(Point(0, height), center)
      ) *
      clamp(
        0.55,
        placement === placeElementWave ? 0.75 : 1.7,
        random.gaussian(0.65, 0.25)
      );

    if (
      ((centerRandom < 0.15 && centerRandom > 0.11) ||
        (centerRandom > 0.15 && random.value() > 0.1)) &&
      placement !== placeElementWave
    ) {
      maxDistance *= 3;

      if (distance(Point(width / 2, height / 2), center) < width / 4) {
        const translationAngle =
          angle(Point(width / 2, height / 2), center) +
          ((random.value() - 0.5) * Math.PI) / 2;
        const newCenter = translateVector(
          (mapRange(random.value(), 0, 1, 0.5, 0.7) * maxDistance) / 10,
          translationAngle,
          center
        );
        center = newCenter;
      }
    }

    if (
      centerRandom < 0.26 &&
      placement === placeElementCircle &&
      circleDeformationStrength < 1.5 &&
      directionFunction === directionFlat
    ) {
      maxDistance *= 1.5;
    }

    const alternativeCenters = new Array(
      random.value() > 0.9 && circleDeformationStrength < 1
        ? Math.round(clamp(0, 3, Math.abs(random.gaussian(0, 2))))
        : 0
    )
      .fill(null)
      .map((_, index) => {
        let alternativeCenter;
        let attempt = 1000;
        do {
          alternativeCenter = Point(
            mapRange(random.value(), 0, 1, 0.15, 0.85) * width,
            mapRange(random.value(), 0, 1, 0.15, 0.85) * height
          );
          attempt--;
        } while (
          distance(center, alternativeCenter) <
            Math.min(maxDistance * 0.8, height / 2) &&
          attempt > 0
        );
        return alternativeCenter;
      })
      .filter(Boolean);

    if (alternativeCenters.length > 0) {
      initialWidth *= 0.9;
    }

    const mainCenterProbability = 4;
    const allCenters = new Array(mainCenterProbability)
      .fill(center)
      .concat(alternativeCenters);
    const allDistances = allCenters.map((currentCenter) => {
      if (currentCenter === center) {
        return maxDistance * 0.7;
      } else {
        return maxDistance * clamp(0.3, 0.6, random.gaussian(0.45, 0.2));
      }
    });

    if (
      allDistances[0] < width / 3 &&
      allDistances.length === mainCenterProbability
    ) {
      numberOfElements /= 2;
    }

    function darkenIfDarkBackground(color: CanvasJpColorHsv) {
      return isDarkBackground
        ? Color(color.h, color.s * 1.1, color.v * 0.93)
        : color;
    }

    // One element is kind of one brush stroke. It starts big, grows smaller
    // and changes its color on its course.
    function makeElement(
      length: number,
      startPoint: CanvasJpPoint,
      initialWidth: number,
      indexProgress: number,
      usedCenter: CanvasJpPoint
    ) {
      if (random.value() < 0.5) {
        const multiplier = mapRange(random.value(), 0, 1, 1, 2.5);
        length /= multiplier;
        initialWidth /= multiplier;
      } else if (indexProgress < 0.2 && random.value() < 0.05) {
        const multiplier = mapRange(
          random.value(),
          0,
          1,
          1,
          mode === "Tiny" ? 1.5 : 2
        );
        length *= multiplier;
        initialWidth *= multiplier;
      }

      const isEraser = random.value() > (hasNoGradient ? 0.7 : 0.95);
      const endColor = isEraser ? backgroundColor : colorPicker.getMainColor();
      const startColor = isEraser
        ? backgroundColor
        : colorPicker.getSecondColor(endColor, indexProgress);
      const opacityBreakpoint = random.gaussian(0.6, 0.05);
      const opacityOffset = random.value() * 10000;

      // If two points have the same exact position, we still want to apply some
      // kind of offset on its deformation. If we don't, it makes things a bit too
      // stiff.
      const offsetFlow = Point(
        random.gaussian(0, width / 50),
        random.gaussian(0, width / 50)
      );

      // Number of circles used to draw the gradient (each element is just a
      // bunch of circles with different sizes and colors)
      const numberOfCircles = Math.ceil(length / gradientPrecision);
      const distanceBetweenCircles = length / numberOfCircles;

      const element: Array<CanvasJpArc> = [];
      let initialPosition = startPoint;
      for (let index = 0; index < numberOfCircles; index++) {
        // Progress 0 => first circle, 1 => last circle
        // the easing makes the shapes a bit more organic.
        const progress =
          index < numberOfCircles / 4
            ? inSine(1 - index / (numberOfCircles / 4))
            : inOutSine(
                (index - numberOfCircles / 4) / ((numberOfCircles / 4) * 3 - 1)
              );
        const colorProgress = inOutSine(index / (numberOfCircles - 1));

        // This first flow field is a way to apply some "wave" deformation on
        // each stroke.
        // It was the first idea behind this sketch, but meh, didn't really work.
        // So it's strength was strongly reduced :)
        const currentAngle = angle(usedCenter, initialPosition);
        const clampingMax =
          placement === placeElementWave
            ? sinusoidalDeformationStrength
            : sinusoidalDeformationStrength / 2;
        const mainFlowFieldRandom = clamp(
          -length * clampingMax,
          length * clampingMax,
          random.noise2D(
            sinusoidalDeformationFrequence * Math.cos(currentAngle),
            sinusoidalDeformationFrequence * Math.sin(currentAngle)
          ) *
            length *
            sinusoidalDeformationStrength
        );

        // This second flowfield adds a global deformation to the sphere
        const flowField =
          random.noise2D(
            (initialPosition.x + offsetFlow.x) / flowFieldZoom,
            (initialPosition.y + offsetFlow.y) / flowFieldZoom
          ) *
          length *
          circleDeformationStrength;

        // Angle tangent to the circle
        const direction = directionFunction(
          initialPosition,
          usedCenter,
          startPoint
        );

        // Moving the circle normally to its next position
        initialPosition = translateVector(
          distanceBetweenCircles,
          direction,
          initialPosition
        );

        // then apply the deformations
        const positionWithMainFlowField = translateVector(
          mainFlowFieldRandom,
          angle(usedCenter, initialPosition),
          initialPosition
        );
        const positionWithSmallFlowField =
          placeElementGrid === placement
            ? translateVector(
                flowField / 2,
                angle(usedCenter, initialPosition),
                positionWithMainFlowField
              )
            : translateVector(
                flowField,
                angle(usedCenter, initialPosition),
                positionWithMainFlowField
              );

        const sizeRandomness = hasVariableSize
          ? clamp(
              0,
              1,
              mapRange(
                random.noise1D(
                  (clamp(0, 1, progress) * length) / 5 + opacityOffset
                ),
                -1,
                1,
                0.1,
                0.6
              )
            )
          : 1;

        let opacity =
          colorProgress > opacityBreakpoint
            ? inSine(mapRange(colorProgress, opacityBreakpoint, 1, 1, 0))
            : 1;

        let color = hasNoGradient
          ? darkenIfDarkBackground(startColor || colorPicker.getGlitchColor())
          : startColor && endColor
          ? colorMixerAmplified(
              startColor,
              endColor,
              colorDirection(
                clamp(0, 1, random.gaussian(colorProgress, gradientRoughness))
              )
            )
          : colorPicker.getGlitchColor();

        if (hasNoGradient && gradientRoughness > 0 && !isEraser) {
          color = Color(
            color.h,
            color.s,
            color.v * (1 - clamp(0, 1, random.gaussian(0, gradientRoughness)))
          );
        }

        element.push(
          Circle(
            positionWithSmallFlowField,
            initialWidth * (1 - progress) * sizeRandomness,
            {
              color: color,
              opacity: opacity,
            }
          )
        );
      }

      return element;
    }

    const directionCenter =
      random.value() < 0.85
        ? center
        : Point(
            mapRange(random.value(), 0, 1, 0.3, 0.7) * width,
            mapRange(random.value(), 0, 1, 0.3, 0.7) * height
          );

    let elementDirection =
      random.value() > 0.6 ? 0 : ((random.value() - 0.5) * Math.PI) / 2;
    function directionConcentric(
      initialPosition: CanvasJpPoint,
      usedCenter: CanvasJpPoint
    ) {
      return (
        angle(
          directionCenter === center ? usedCenter : directionCenter,
          initialPosition
        ) +
        Math.PI / 2 -
        elementDirection
      );
    }
    directionConcentric.fxname = "Void";

    const flatDirection = random.value() * Math.PI * 2;
    function directionFlat(initialPosition: CanvasJpPoint) {
      return flatDirection;
    }
    directionFlat.fxname = "Wind";

    const frequency = mapRange(random.value(), 0, 1, 5, 10);
    function directionFlowField(initialPosition: CanvasJpPoint) {
      return (
        random.noise2D(
          initialPosition.x / width / frequency,
          initialPosition.y / width / frequency
        ) *
        Math.PI *
        2
      );
    }
    directionFlowField.fxname = "Flow";

    const inSphereThreshold = circleDeformationStrength > 1 ? 0.05 : 0.3;

    function placeElementCircle(index: number) {
      const centerIndex = Math.floor(random.value() * allCenters.length);
      const usedCenter = allCenters[centerIndex];
      const maxDistanceForCurrentCenter = allDistances[centerIndex];

      const inSphere =
        random.value() > inSphereThreshold / (usedCenter === center ? 1 : 2);

      const sphereRadius =
        Math.min(width * 0.65, maxDistanceForCurrentCenter) - margin;
      const circleRadius = sphereRadius + margin * 3;
      const circleAngle = mapRange(random.value(), 0, 1, 0, Math.PI * 2);
      const circleDistance = mapRange(
        Math.pow(random.value(), 2.5),
        0,
        1,
        sphereRadius,
        circleRadius
      );
      const [x, y] = inSphere
        ? random.onSphere(sphereRadius)
        : [
            circleDistance * Math.cos(circleAngle),
            circleDistance * Math.sin(circleAngle),
          ];
      const elementCenter = Point(x + usedCenter.x, y + usedCenter.y);

      // Change some base parameters based on the position of the element.
      // If it's far from the center, make it smaller.
      const distanceFromCenter = distance(usedCenter, elementCenter);

      let closestCenter = usedCenter;
      let maxDistanceFromCenters = distanceFromCenter;
      for (let centerItem of allCenters) {
        let distanceFromCenter = distance(centerItem, elementCenter);
        if (distanceFromCenter < maxDistanceFromCenters) {
          maxDistanceFromCenters = distanceFromCenter;
          closestCenter = centerItem;
        }
      }

      let progress = inSphere
        ? maxDistanceFromCenters / sphereRadius
        : 1 -
          (maxDistanceFromCenters - sphereRadius) /
            (circleRadius - sphereRadius);

      progress = progress * (maxDistanceForCurrentCenter / maxDistance);

      if (
        directionFunction === directionFlat &&
        distanceFromCenter > sphereRadius * 0.5
      ) {
        if (
          random.value() >
          Math.pow(distanceFromCenter / circleDistance, 0.5) * 0.8
        ) {
          return;
        }
      }

      return {
        progress: clamp(
          0,
          2,
          random.gaussian(inSphere ? Math.sqrt(progress) : progress / 2, 0.05)
        ),
        elementCenter,
        distanceFromCenter: clamp(
          0,
          1,
          random.gaussian(
            inSphere ? maxDistanceFromCenters : maxDistanceFromCenters / 2,
            0.2
          )
        ),
        usedCenter: closestCenter,
      };
    }
    placeElementCircle.fxname = "Circle";

    let waveDirection = (progress) => Math.pow(progress, 0.8);
    function placeElementWave(index: number) {
      const elementCenter = Point(
        random.value() * (width - waveMargin * 2) + waveMargin,
        random.value() * (height - waveMargin * 2) + waveMargin
      );
      const distanceFromCenter = distance(center, elementCenter);
      const progress = 1 - distanceFromCenter / (maxDistance - waveMargin);
      return {
        progress: waveDirection(clamp(0, 1, random.gaussian(progress, 0.2))),
        elementCenter,
        distanceFromCenter: waveDirection(
          clamp(0, 1, random.gaussian(distanceFromCenter, 0.2))
        ),
        usedCenter: center,
      };
    }
    placeElementWave.fxname = "Gravity";

    function placeElementRandom() {
      const elementCenter = Point(
        random.value() * (width - waveMargin * 2) + waveMargin,
        random.value() * (height - waveMargin * 2) + waveMargin
      );

      const baseProgress = clamp(
        0,
        1,
        mapRange(
          random.noise2D(
            (elementCenter.x / width) * 4,
            (elementCenter.y / width) * 4
          ),
          -0.7,
          0.7,
          0.2,
          1
        ) + random.gaussian(0, 0.1)
      );

      return {
        progress: clamp(0, 1, random.gaussian(baseProgress, 0.1)),
        elementCenter,
        distanceFromCenter: clamp(0, 1, random.gaussian(0.5, 0.1)),
        usedCenter: center,
      };
    }
    placeElementRandom.fxname = "Random";

    const corners = [
      Point(waveMargin, waveMargin),
      Point(width - waveMargin, waveMargin),
      Point(width - waveMargin, height - waveMargin),
      Point(waveMargin, height - waveMargin),
    ];
    const gridSpacingModifier = mapRange(random.value(), 0, 1, 1, 1.5);
    if (placement === placeElementGrid && circleDeformationStrength < 1) {
      numberOfElements = numberOfElements * gridSpacingModifier;
    }
    const maxGridDistance = Math.max(
      ...corners.map((corner) => distance(corner, center))
    );

    const spacingRigidity = mapRange(
      Math.pow(random.value(), 2),
      0,
      1,
      0.25,
      0
    );
    function placeElementGrid(index: number) {
      const numberOfElementsPerRow = Math.round(Math.sqrt(numberOfElements));
      const gridSpacingColumns = width / numberOfElementsPerRow;
      const gridSpacingRows = height / numberOfElementsPerRow;

      const x = index % numberOfElementsPerRow;
      const y = Math.floor(index / numberOfElementsPerRow);

      // if (
      //   y * numberOfElementsPerRow + numberOfElementsPerRow >
      //   numberOfElements * gridSpacingModifier * gridSpacingModifier
      // ) {
      //   return;
      // }

      const flatDirectionOffset =
        directionFunction === directionFlat ? 0.75 * length : 0;

      const elementCenter = Point(
        x * gridSpacingColumns -
          (flatDirectionOffset * Math.cos(flatDirection)) / 2 +
          random.gaussian(0, gridSpacingColumns * spacingRigidity),
        y * gridSpacingRows -
          (flatDirectionOffset * Math.sin(flatDirection)) / 2 +
          random.gaussian(0, gridSpacingColumns * spacingRigidity)
      );

      return {
        progress: clamp(0, 1, random.gaussian(0.75, 0.2)),
        elementCenter,
        distanceFromCenter:
          distance(center, elementCenter) / maxGridDistance +
          random.gaussian(0, 0.3),
        usedCenter: center,
      };
    }
    placeElementGrid.fxname = "Grid";

    function identity(element) {
      return element;
    }
    identity.fxname = "Default";

    const symetryAngle = (random.value() * Math.PI) / 2;
    const symetryCenter = Point(width / 2, height / 2);
    function symmetry(elements: CanvasJpArc[]) {
      return elements.concat(
        elements.map((element) => {
          const elementAngle = angle(symetryCenter, element.center);
          const elementDistance = distance(symetryCenter, element.center);
          return Circle(
            translateVector(
              0,
              symetryAngle,
              translateVector(
                elementDistance,
                elementAngle + Math.PI,
                symetryCenter
              )
            ),
            element.radius,
            element.fill
          );
        })
      );
    }
    symmetry.fxname = "Symmetry";

    function line(elements: CanvasJpArc[]): CanvasJpDrawable[] {
      let prevElement = elements[0];
      let prevTangent = 0;
      const offset = random.gaussian(0, 0.08);

      return new Array<CanvasJpDrawable>().concat(elements).concat(
        elements
          .map((element, index) => {
            const progress =
              index < elements.length * 0.2
                ? inSine(mapRange(index, 0, elements.length * 0.2, 0, 1))
                : index > elements.length * 0.8
                ? outSine(
                    mapRange(
                      index,
                      elements.length * 0.8,
                      elements.length,
                      1,
                      0
                    )
                  )
                : 1;

            const tangent =
              angle(prevElement.center, element.center) + Math.PI / 2;

            const line = Line(
              translateVector(
                offset * prevElement.radius,
                prevTangent,
                prevElement.center
              ),
              translateVector(offset * element.radius, tangent, element.center),
              {
                color: element.fill?.color as CanvasJpColorHsv,
                opacity: element.fill?.opacity || 0,
                width: element.radius * 0.3 * progress,
                style: CanvasJpStrokeStyle.round,
              }
            );

            prevElement = element;
            prevTangent = tangent;

            return line;
          })
          .slice(1, -1)
      );
    }
    line.fxname = "Feather";

    const useOnlyBaseRotation = random.value() < 0.2;
    const rotationOffset =
      random.value() * (useOnlyBaseRotation ? Math.PI : Math.PI * 0.22);
    const lengthFactor = useOnlyBaseRotation
      ? 1
      : clamp(0, 5, 1 / Math.cos(rotationOffset));
    function stripe(elements: CanvasJpArc[]): CanvasJpDrawable[] {
      let prevElement = elements[0];
      return new Array<CanvasJpDrawable>().concat(
        elements
          .map((element, index) => {
            const progress = index / elements.length;
            let elementAngle = angle(prevElement.center, element.center);
            let tangent = 0;
            if (!useOnlyBaseRotation) {
              tangent = elementAngle + Math.PI / 2;
            }
            tangent += random.gaussian(0, 0.05);

            prevElement = element;

            let basePosition = translateVector(
              random.gaussian(0, (width / 300) * progress),
              elementAngle,
              element.center
            );

            const start = rotate(
              basePosition,
              rotationOffset,
              translateVector(
                element.radius * lengthFactor,
                tangent,
                basePosition
              )
            );
            const end = rotate(
              basePosition,
              rotationOffset,
              translateVector(
                -element.radius * lengthFactor,
                tangent,
                basePosition
              )
            );

            return Line(start, end, {
              color: element.fill?.color as CanvasJpColorHsv,
              opacity: element.fill?.opacity || 0,
              style: CanvasJpStrokeStyle.round,
              width: width / 300,
            });
          })
          .filter(Boolean)
          .slice(1, -1)
      );
    }
    stripe.fxname = "Stripe";

    function transformBorder(elements: CanvasJpArc[]) {
      const threshold = clamp(
        1,
        Number.MAX_SAFE_INTEGER,
        Math.round(elements.length * 0.05)
      );
      return elements.concat(
        elements.slice(threshold, -threshold).map((element) => {
          return Circle(element.center, element.radius * 0.8, {
            color: backgroundColor,
            opacity: 0.08,
          });
        })
      );
    }
    transformBorder.fxname = "Neon";

    const hasNoisyPhase = colorMixer !== randomMix && random.value() > 0.9;
    const minimumEdge = hasNoisyPhase ? 5 : 3;

    const numberOfEdges = clamp(
      minimumEdge,
      Number.MAX_SAFE_INTEGER,
      Math.ceil(random.gaussian(minimumEdge, 2))
    );
    const angleBackward = random.value() > 0.5;
    function tranformShape(elements: CanvasJpArc[]) {
      let previousElement = elements[0];
      const result = elements
        .map((element) => {
          const phase =
            angle(element.center, previousElement.center) +
            (hasNoisyPhase ? random.gaussian(Math.PI, 0.3) : 0);
          previousElement = element;
          return SmoothShape(
            new Array(numberOfEdges).fill(null).map((_, index) => {
              const progress = index / numberOfEdges;
              const pointAngle = progress * Math.PI * 2 + phase;
              return translateVector(
                element.radius,
                pointAngle,
                element.center
              );
            }),
            0.15,
            element.fill
          );
        })
        .slice(1);

      return angleBackward ? result.reverse() : result;
    }
    tranformShape.fxname = "Shape";

    function transformClouds(elements: CanvasJpArc[]) {
      if (random.value() > 0.3) {
        return;
      }
      let streetTag = new Array<CanvasJpDrawable>();

      let previousElement = elements[0];
      for (let i = 1; i < elements.length; i++) {
        const currentElement = elements[i];
        let angleBetweenElements = angle(
          previousElement.center,
          currentElement.center
        );
        let distanceBetweenElements = distance(
          currentElement.center,
          previousElement.center
        );

        const numberOfCircles = Math.ceil(
          distanceBetweenElements / gradientPrecision
        );
        const distanceBetweenCircles =
          distanceBetweenElements / numberOfCircles;

        streetTag = streetTag.concat(
          new Array(numberOfCircles).fill(null).map((_, index) => {
            const progress = index / numberOfCircles;
            const positionOnMainLine = translateVector(
              progress * distanceBetweenElements,
              angleBetweenElements,
              currentElement.center
            );
            const distanceFromMainLine = Math.pow(
              clamp(-1, 1, random.gaussian(0, 0.35)),
              2.2
            );
            return Circle(
              translateVector(
                distanceFromMainLine *
                  currentElement.radius *
                  1.5 *
                  (random.value() > 0.1 ? 1 : -0.5),
                angleBetweenElements + Math.PI / 2,
                positionOnMainLine
              ),
              currentElement.radius,
              {
                ...currentElement.fill,
                opacity: currentElement.fill?.opacity,
              } as CanvasJpFill
            );
          })
        );

        previousElement = currentElement;
      }

      return streetTag;
    }
    transformClouds.fxname = "Cloud";

    const cadreWidth = Math.round(width / 400);
    const cadreColor = backgroundColor;
    let cadre = [
      PolygonFromRect(0, 0, width, cadreWidth).toShape({
        color: cadreColor,
        opacity: 1,
      }),
      PolygonFromRect(0, 0, cadreWidth, height).toShape({
        color: cadreColor,
        opacity: 1,
      }),
      PolygonFromRect(0, height - cadreWidth, width, cadreWidth).toShape({
        color: cadreColor,
        opacity: 1,
      }),
      PolygonFromRect(width - cadreWidth, 0, cadreWidth, height).toShape({
        color: cadreColor,
        opacity: 1,
      }),
    ];

    const progressBarColor = colorMixerAmplified(
      backgroundColor,
      colorPicker.getSecondColor(backgroundColor) ||
        colorPicker.getProgressBarColor(),
      0.55
    );
    const progressBarWidth = width / 400;
    function progressBar(progress) {
      return cadre.concat([
        // bottom left -> top left
        PolygonFromRect(0, 0, progressBarWidth, height * progress).toShape({
          color: progressBarColor,
          opacity: 1,
        }),
        // top left -> top right
        PolygonFromRect(
          0,
          height - progressBarWidth,
          width * progress,
          progressBarWidth
        ).toShape({
          color: progressBarColor,
          opacity: 1,
        }),
        // top right -> bottom right
        PolygonFromRect(
          width - progressBarWidth,
          height * (1 - progress),
          progressBarWidth,
          height * progress
        ).toShape({
          color: progressBarColor,
          opacity: 1,
        }),

        // top left -> top right
        PolygonFromRect(
          width * (1 - progress),
          0,
          width * progress,
          progressBarWidth
        ).toShape({
          color: progressBarColor,
          opacity: 1,
        }),
      ]);
    }

    const background = PolygonFromRect(0, 0, width, height).toShape({
      opacity: 1,
      color: backgroundColor,
    });

    let texture = new Array<CanvasJpDrawable>();
    const textureLength = width / 200;

    const moveTextureLines = (point) => {
      return translateVector(
        mapRange(
          random.noise2D(point.x / 100, point.y / 100),
          -1,
          1,
          0,
          textureLength / 2
        ),
        mapRange(
          random.noise2D(point.x / 100, point.y / 100),
          -1,
          1,
          0,
          Math.PI * 2
        ),
        point
      );
    };

    const offset = Point(0, random.gaussian(0, textureLength / 2));
    for (let x = 0; x < width / textureLength; x++) {
      for (let y = 0; y < height / textureLength; y++) {
        const startTextureLine = Point(x * textureLength, y * textureLength);
        const endTextureLine = Point(
          x * textureLength + textureLength,
          y * textureLength
        );
        texture.push(
          Line(
            moveTextureLines(startTextureLine),
            translate(offset.x, offset.y, moveTextureLines(endTextureLine)),
            {
              color: Color(
                0,
                0,
                mapRange(
                  random.noise2D(startTextureLine.x / 100, startTextureLine.y),
                  -1,
                  1,
                  0.2,
                  0.8
                ) *
                  (y / (height / textureLength))
              ),
              opacity: 0.06,
              width: mapRange(
                random.noise2D(startTextureLine.x / 100, startTextureLine.y),
                -1,
                1,
                0.3,
                2.5
              ),
            }
          )
        );
      }
    }

    // @ts-ignore
    window.$fxhashFeatures = {
      Position: placement.fxname,
      Direction: directionFunction.fxname,
      "Color Picker": colorPickerFactory.fxname,
      "Color Mixer": hasNoGradient ? "Flat" : colorMixer.fxname,
      Style: transformElement.fxname,
    };
    console.log(window.$fxhashFeatures);

    let themeColor = document.querySelector("meta[name=theme-color]");
    if (!themeColor) {
      themeColor = document.createElement("meta");
      themeColor.setAttribute("name", "theme-color");
      document.head.append(themeColor);
    }
    themeColor.setAttribute("content", colorPicker.getBackgroundColor().hex());

    document.body.style.setProperty(
      "--color",
      Color(
        backgroundColor.h,
        backgroundColor.s,
        backgroundColor.v > 0.5 ? 0.2 : 0.8
      ).hex()
    );
    document.body.style.setProperty(
      "--actions-color",
      Color(backgroundColor.h, backgroundColor.s * 0.1, 1).hex()
    );

    yield {
      background: backgroundColor,
      elements: new Array<CanvasJpDrawable>()
        .concat(background)
        .concat(progressBar(0)),
    };

    let grid = new Array<{
      element: CanvasJpDrawable[];
      position: number;
    }>();

    // Draw many elements. Position them on a sphere randomly. Once projected on a
    // 2D plan, it makes the center less dense than the outside
    for (let pointIndex = 0; pointIndex < numberOfElements; pointIndex++) {
      const placementResult = placement(pointIndex);
      if (!placementResult) {
        continue;
      }
      const { progress, elementCenter, distanceFromCenter, usedCenter } =
        placementResult;

      const element = makeElement(
        length * progress * clamp(0, 3, random.gaussian(1, 0.1)),
        elementCenter,
        initialWidth * progress * clamp(0, 3, random.gaussian(1, 0.3)),
        pointIndex / numberOfElements,
        usedCenter
      );

      const lengthOfFade = 10;
      const wiggle = random.gaussian(0, 0.15);
      let continueToAddShapes = true;
      const cutElement = element.filter((shape) => {
        continueToAddShapes = continueToAddShapes && isVisible(shape, wiggle);
        return continueToAddShapes;
      });
      const cutElementWithFade = cutElement.slice(0, -lengthOfFade).concat(
        cutElement.slice(-lengthOfFade).map((shape, index) => {
          const radiusProgress = 1 - index / lengthOfFade;
          const opacityProgress =
            index === lengthOfFade - 1
              ? 0.85
              : index === lengthOfFade - 2
              ? 0.95
              : 1;
          return Circle(
            shape.center,
            shape.radius *
              mapRange(Math.pow(radiusProgress, 0.5), 0, 1, 0.3, 1),
            {
              ...shape.fill,
              opacity: (shape.fill?.opacity || 1) * opacityProgress,
            } as CanvasJpFill
          );
        })
      );

      const cutElementDistance =
        cutElementWithFade.length > 1
          ? distance(
              cutElementWithFade[0].center,
              cutElementWithFade[cutElementWithFade.length - 1].center
            )
          : 0;
      const elementDistance =
        element.length > 1
          ? distance(element[0].center, element[element.length - 1].center)
          : 0;

      if (
        elementDistance > 0 &&
        cutElementDistance > 0 &&
        (cutElementDistance > width / 30 || elementDistance <= width / 30)
      ) {
        const transformedElement = transformElement(cutElementWithFade);
        if (transformedElement) {
          grid.push({
            element: transformedElement,
            position: distanceFromCenter,
          });
        }
      }
    }

    // Draw the outer elements first. This helps creating some sort of depth feeling
    if (directionFunction !== directionFlat || placement === placeElementGrid) {
      grid.sort((a, b) => a.position - b.position);
    }

    if (placement === placeElementGrid) {
      const thresholdOfElements = mapRange(
        Math.pow(random.value(), 7),
        0,
        1,
        0.3,
        0.8
      );
      grid = grid.slice(0, grid.length * thresholdOfElements);
    }

    function isVisible(shape: CanvasJpArc, wiggle: number) {
      const margin = waveMargin + shape.radius * (0.6 + wiggle);
      return (
        shape.center.x > margin &&
        shape.center.x < width - margin &&
        shape.center.y > margin &&
        shape.center.y < height - margin
      );
    }

    if (animate) {
      const totalNumberOfShapesToDraw = grid
        .map(({ element }) => element.length)
        .reduce((acc, length) => acc + length, 0);

      const getNumberOfElementsPerFrame = () =>
        (totalNumberOfShapesToDraw / getTimeToDraw()) * 16.6;

      let numberOfRenderedElements = 0;
      let elementsToRender = new Array<CanvasJpDrawable>();

      let lastFrame = Number.MAX_SAFE_INTEGER;
      let start = performance.now();

      for (let { element } of grid) {
        for (let shape of element) {
          elementsToRender.push(shape);
          numberOfRenderedElements++;

          let numberOfElementsPerFrame = getNumberOfElementsPerFrame();
          if (elementsToRender.length > numberOfElementsPerFrame) {
            yield {
              background: null,
              elements: new Array<CanvasJpDrawable>()
                .concat(elementsToRender)
                .concat(
                  progressBar(
                    1 - numberOfRenderedElements / totalNumberOfShapesToDraw
                  )
                ),
            };

            let end = performance.now();
            lastFrame = end - start;
            start = end;

            if (timeAuto && !save) {
              if (lastFrame > 40) {
                numberOfElementsPerFrame /= 1.2;
                timeToDraw = timeToDraw * 1.2;
              } else if (lastFrame < 20 && timeToDraw > defaultTimeToDraw) {
                timeToDraw = timeToDraw / 1.2;
              }
            }

            elementsToRender = [];
          }
        }
      }

      yield {
        background: null,
        elements: elementsToRender.concat(cadre),
      };
    } else {
      yield {
        background: null,
        elements: grid
          .map(({ element }) => element)
          .flat()
          .concat(cadre),
      };
    }
  },
  () => {
    const params = new URLSearchParams(window.location.search);

    let width = 1200;
    let height = (width / 21) * 29.7;
    const windowRatio = window.innerWidth / window.innerHeight;

    const imageRatio = width / height;
    const resolutionFactor =
      windowRatio > imageRatio
        ? window.innerHeight / height
        : window.innerWidth / width;

    const selectedWidth = Number(params.get("width"));
    const resolution = selectedWidth ? selectedWidth / width : resolutionFactor;

    return {
      width: width,
      height: height,
      resolution: resolution,
      interactive: false,
      plugins: [fxhashCollection(hashes), prodMode("Feathers-JulienPradet")],
    };
  }
);
