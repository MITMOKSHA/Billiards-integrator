import React, { useState } from 'react';

interface Player {
  key: string;
  name: string;
  score: number;
  order: number;
}

const ScoreBoard: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [currentRound, setCurrentRound] = useState(1);

  const handleResetScores = () => {
    setPlayers((prevPlayers) =>
      prevPlayers.map((player) => ({
        ...player,
        score: 0,
      })),
    );
    setCurrentRound(1);
  };

  const addPlayer = () => {
    if (newPlayerName.trim() === '') return;

    const newPlayer: Player = {
      key: Date.now().toString(),
      name: newPlayerName,
      score: 0,
      order: players.length + 1,
    };

    setPlayers([...players, newPlayer]);
    setNewPlayerName('');
  };

  const updateScore = (key: string, points: number) => {
    setPlayers(
      players.map((player) =>
        player.key === key ? { ...player, score: player.score + points } : player,
      ),
    );
  };

  const updateOrderWithPlayers = (winnerKey: string, players: Player[], loserKey?: string) => {
    const winner = players.find((p) => p.key === winnerKey);
    const loser = loserKey ? players.find((p) => p.key === loserKey) : null;

    setCurrentRound((prevRound) => prevRound + 1);

    if (winner) {
      if (loser) {
        // 小金和普胜情况：胜者第一，败者第二，其余按原顺序
        return [
          { ...winner, order: 1 },
          { ...loser, order: 2 },
          ...players
            .filter((p) => p.key !== winnerKey && p.key !== loserKey)
            .sort((a, b) => a.order - b.order)
            .map((p, i) => ({ ...p, order: i + 3 })),
        ];
      } else {
        // 大金和黄金九情况：胜者第一，其余按原顺序
        return [
          { ...winner, order: 1 },
          ...players
            .filter((p) => p.key !== winnerKey)
            .sort((a, b) => a.order - b.order)
            .map((p, i) => ({ ...p, order: i + 2 })),
        ];
      }
    }
    return players;
  };

  const handleBigWin = (key: string) => {
    setPlayers((prevPlayers) => {
      const otherPlayersCount = prevPlayers.length - 1;
      const totalWinPoints = otherPlayersCount * 10;

      const updatedPlayers = prevPlayers.map((player) => {
        if (player.key === key) {
          return { ...player, score: player.score + totalWinPoints };
        }
        return { ...player, score: player.score - 10 };
      });
      return updateOrderWithPlayers(key, updatedPlayers);
    });
  };

  const handleSmallWin = (key: string) => {
    setPlayers((prevPlayers) => {
      const winnerIndex = prevPlayers.findIndex((p) => p.key === key);
      const previousPlayerIndex = (winnerIndex - 1 + prevPlayers.length) % prevPlayers.length;

      const updatedPlayers = prevPlayers.map((player, index) => {
        if (player.key === key) {
          return { ...player, score: player.score + 9 };
        } else if (index === previousPlayerIndex) {
          return { ...player, score: player.score - 9 };
        }
        return player;
      });

      return updateOrderWithPlayers(key, updatedPlayers, prevPlayers[previousPlayerIndex].key);
    });
  };

  const handleGoldenNine = (key: string) => {
    setPlayers((prevPlayers: Player[]) => {
      const otherPlayersCount = prevPlayers.length - 1;
      const totalWinPoints = otherPlayersCount * 4;

      const updatedPlayers = prevPlayers.map((player: Player) => {
        if (player.key === key) {
          return { ...player, score: player.score + totalWinPoints };
        }
        return { ...player, score: player.score - 4 };
      });
      return updateOrderWithPlayers(key, updatedPlayers);
    });
  };

  const handleBlackGold = (key: string) => {
    setPlayers((prevPlayers: Player[]) => {
      const otherPlayersCount = prevPlayers.length - 1;
      const totalLosePoints = otherPlayersCount * 4;

      const updatedPlayers = prevPlayers.map((player: Player) => {
        if (player.key === key) {
          return { ...player, score: player.score - totalLosePoints };
        }
        return { ...player, score: player.score + 4 };
      });
      return updateOrderWithPlayers(key, updatedPlayers);
    });
  };

  const handleNormalWin = (key: string) => {
    setPlayers((prevPlayers) => {
      const winnerIndex = prevPlayers.findIndex((p) => p.key === key);
      const previousPlayerIndex = (winnerIndex - 1 + prevPlayers.length) % prevPlayers.length;

      const updatedPlayers = prevPlayers.map((player, index) => {
        if (player.key === key) {
          return { ...player, score: player.score + 4 };
        } else if (index === previousPlayerIndex) {
          return { ...player, score: player.score - 4 };
        }
        return player;
      });

      return updateOrderWithPlayers(key, updatedPlayers, prevPlayers[previousPlayerIndex].key);
    });
  };

  const movePlayerUp = (key: string) => {
    setPlayers((prevPlayers) => {
      const playerIndex = prevPlayers.findIndex((p) => p.key === key);
      if (playerIndex <= 0) return prevPlayers;

      const newPlayers = [...prevPlayers];
      // 交换玩家位置而不是只交换order
      [newPlayers[playerIndex], newPlayers[playerIndex - 1]] = [
        newPlayers[playerIndex - 1],
        newPlayers[playerIndex],
      ];

      // 重新计算所有玩家的order
      return newPlayers.map((p, i) => ({
        ...p,
        order: i + 1,
      }));
    });
  };

  const movePlayerDown = (key: string) => {
    setPlayers((prevPlayers) => {
      const playerIndex = prevPlayers.findIndex((p) => p.key === key);
      if (playerIndex === -1 || playerIndex >= prevPlayers.length - 1) return prevPlayers;

      const newPlayers = [...prevPlayers];
      // 交换玩家位置而不是只交换order
      [newPlayers[playerIndex], newPlayers[playerIndex + 1]] = [
        newPlayers[playerIndex + 1],
        newPlayers[playerIndex],
      ];

      // 重新计算所有玩家的order
      return newPlayers.map((p, i) => ({
        ...p,
        order: i + 1,
      }));
    });
  };

  const handleFoul = (key: string) => {
    setPlayers((prevPlayers) => {
      const foulPlayerIndex = prevPlayers.findIndex((p) => p.key === key);
      const previousPlayerIndex = (foulPlayerIndex - 1 + prevPlayers.length) % prevPlayers.length;

      return prevPlayers.map((player, index) => {
        if (player.key === key) {
          return { ...player, score: player.score - 1 };
        } else if (index === previousPlayerIndex) {
          return { ...player, score: player.score + 1 };
        }
        return player;
      });
    });
  };

  const handleConcedePoint = (key: string) => {
    setPlayers((prevPlayers) => {
      const playerIndex = prevPlayers.findIndex((p) => p.key === key);
      const previousPlayerIndex = (playerIndex - 1 + prevPlayers.length) % prevPlayers.length;

      return prevPlayers.map((player, index) => {
        if (player.key === key) {
          return { ...player, score: player.score + 1 };
        } else if (index === previousPlayerIndex) {
          return { ...player, score: player.score - 1 };
        }
        return player;
      });
    });
  };

  return (
    <div style={{ padding: '24px' }}>
      <h1>台球追分小助手</h1>
      <h2>第 {currentRound} 局</h2>

      <div style={{ marginBottom: '16px', display: 'flex', gap: '8px' }}>
        <input
          type="text"
          placeholder="输入玩家姓名"
          value={newPlayerName}
          onChange={(e) => setNewPlayerName(e.target.value)}
          style={{ padding: '8px', marginRight: '8px' }}
        />
        <button
          onClick={addPlayer}
          style={{
            padding: '8px 16px',
            backgroundColor: '#1890ff',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            transition: 'opacity 0.2s',
          }}
          onMouseDown={(e) => (e.currentTarget.style.opacity = '0.5')}
          onMouseUp={(e) => (e.currentTarget.style.opacity = '1')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        >
          添加玩家
        </button>
        <button
          onClick={handleResetScores}
          style={{
            padding: '8px 16px',
            backgroundColor: '#ff4d4f',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            transition: 'opacity 0.2s',
          }}
          onMouseDown={(e) => (e.currentTarget.style.opacity = '0.5')}
          onMouseUp={(e) => (e.currentTarget.style.opacity = '1')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        >
          重置分数
        </button>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ padding: '8px', border: '1px solid #ddd' }}>击球顺序</th>
            <th style={{ padding: '8px', border: '1px solid #ddd' }}>玩家</th>
            <th style={{ padding: '8px', border: '1px solid #ddd' }}>分数</th>
            <th style={{ padding: '8px', border: '1px solid #ddd' }}>操作</th>
          </tr>
        </thead>
        <tbody>
          {players.map((player) => (
            <tr key={player.key}>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}>{player.order}</td>
              <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>
                <div style={{ display: 'inline-block', marginRight: '8px' }}>{player.name}</div>
                <button
                  onClick={() => movePlayerUp(player.key)}
                  style={{
                    padding: '2px 10px',
                    backgroundColor: '#13c2c2',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    marginRight: '4px',
                    transition: 'opacity 0.2s',
                  }}
                  onMouseDown={(e) => (e.currentTarget.style.opacity = '0.5')}
                  onMouseUp={(e) => (e.currentTarget.style.opacity = '1')}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                >
                  ↑
                </button>
                <button
                  onClick={() => movePlayerDown(player.key)}
                  style={{
                    padding: '2px 10px',
                    backgroundColor: '#13c2c2',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    transition: 'opacity 0.2s',
                  }}
                  onMouseDown={(e) => (e.currentTarget.style.opacity = '0.5')}
                  onMouseUp={(e) => (e.currentTarget.style.opacity = '1')}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                >
                  ↓
                </button>
              </td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}>{player.score}</td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {player.order === 1 && (
                    <>
                      <button
                        onClick={() => handleBigWin(player.key)}
                        style={{
                          padding: '4px 8px',
                          backgroundColor: '#1890ff',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          transition: 'opacity 0.2s',
                        }}
                        onMouseDown={(e) => (e.currentTarget.style.opacity = '0.5')}
                        onMouseUp={(e) => (e.currentTarget.style.opacity = '1')}
                        onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                      >
                        大金
                      </button>
                      <button
                        onClick={() => handleGoldenNine(player.key)}
                        style={{
                          padding: '4px 8px',
                          backgroundColor: '#ffc53d',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          marginRight: '4px',
                          transition: 'opacity 0.2s',
                        }}
                        onMouseDown={(e) => (e.currentTarget.style.opacity = '0.5')}
                        onMouseUp={(e) => (e.currentTarget.style.opacity = '1')}
                        onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                      >
                        黄金九
                      </button>
                      <button
                        onClick={() => handleBlackGold(player.key)}
                        style={{
                          padding: '4px 8px',
                          backgroundColor: '#000',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          transition: 'opacity 0.2s',
                        }}
                        onMouseDown={(e) => (e.currentTarget.style.opacity = '0.5')}
                        onMouseUp={(e) => (e.currentTarget.style.opacity = '1')}
                        onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                      >
                        黑金
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleSmallWin(player.key)}
                    style={{
                      padding: '4px 8px',
                      backgroundColor: '#1890ff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      transition: 'opacity 0.2s',
                    }}
                    onMouseDown={(e) => (e.currentTarget.style.opacity = '0.5')}
                    onMouseUp={(e) => (e.currentTarget.style.opacity = '1')}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                  >
                    小金
                  </button>
                  <button
                    onClick={() => handleNormalWin(player.key)}
                    style={{
                      padding: '4px 8px',
                      backgroundColor: '#f0f0f0',
                      color: '#333',
                      border: '1px solid #d9d9d9',
                      borderRadius: '4px',
                      transition: 'opacity 0.2s',
                    }}
                    onMouseDown={(e) => (e.currentTarget.style.opacity = '0.5')}
                    onMouseUp={(e) => (e.currentTarget.style.opacity = '1')}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                  >
                    普胜
                  </button>
                  <button
                    onClick={() => handleFoul(player.key)}
                    style={{
                      padding: '4px 8px',
                      backgroundColor: '#ff4d4f',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      marginRight: '4px',
                      transition: 'opacity 0.2s',
                    }}
                    onMouseDown={(e) => (e.currentTarget.style.opacity = '0.5')}
                    onMouseUp={(e) => (e.currentTarget.style.opacity = '1')}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                  >
                    犯规
                  </button>
                  <button
                    onClick={() => handleConcedePoint(player.key)}
                    style={{
                      padding: '4px 8px',
                      backgroundColor: '#722ed1',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      transition: 'opacity 0.2s',
                    }}
                    onMouseDown={(e) => (e.currentTarget.style.opacity = '0.5')}
                    onMouseUp={(e) => (e.currentTarget.style.opacity = '1')}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                  >
                    让球得分
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 style={{ marginTop: '24px' }}>排行榜</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '16px' }}>
        <thead>
          <tr>
            <th style={{ padding: '8px', border: '1px solid #ddd' }}>排名</th>
            <th style={{ padding: '8px', border: '1px solid #ddd' }}>玩家</th>
            <th style={{ padding: '8px', border: '1px solid #ddd' }}>分数</th>
          </tr>
        </thead>
        <tbody>
          {[...players]
            .sort((a, b) => b.score - a.score)
            .map((player, index) => (
              <tr key={player.key}>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>{index + 1}</td>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>{player.name}</td>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>{player.score}</td>
              </tr>
            ))}
        </tbody>
      </table>
      <div
        style={{
          marginTop: '32px',
          padding: '16px',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
        }}
      >
        <h3>规则说明</h3>
        <ul style={{ listStyleType: 'none', paddingLeft: '0', textAlign: 'left' }}>
          <li>
            <strong>大金</strong>：通常指开球方开球有球落袋后，按顺序将剩余球直至 9
            号球打进，即开球清台。完成大金的选手可得 n * 10 分，其余玩家扣分
          </li>
          <li>
            <strong>小金</strong>：非开球情况下，在台面上有 1 至 9
            号球存在的情况下，将台面剩余球按由小到大的顺序依次击打，最后将 9
            号球打进。完成小金的选手可得 7 分，上家扣分
          </li>
          <li>
            <strong>黄金九</strong>：一般指开球将 9 号球打进。出现黄金九时，击球者赢 n * 4
            分，其余玩家扣分
          </li>
          <li>
            <strong>普胜</strong>：指大金、小金、黄金九未列明的其他胜局。通常是对手没有打进 9
            号球，而己方打进，即可算普胜。胜者可获得4分，上家扣分
          </li>
          <li>
            <strong>犯规</strong>：当前玩家犯规送给下家自由球，当前击球玩家扣1分，上家得分
          </li>
          <li>
            <strong>让球得分</strong>：当前玩家让杆后，上家击球犯规，当前玩家得1分，上家扣分
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ScoreBoard;
