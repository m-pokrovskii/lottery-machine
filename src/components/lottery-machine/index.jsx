import React, { useState, useEffect } from 'react';

const LotteryMachine = () => {
  // State variables
  const [coins, setCoins] = useState(1);
  const [repeatRate, setRepeatRate] = useState(0);
  const [collection, setCollection] = useState([]);
  const [lastWin, setLastWin] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);
  
  // Constants
  const TOTAL_ITEMS = 100; // For test purposes, will be 114 in production
  const REPEAT_INCREASE = ((1 / TOTAL_ITEMS) * 100) * 2; // Percentage increase for repeats
  
  // Items data - simplified for testing
  const items = Array.from({ length: TOTAL_ITEMS }, (_, i) => {
		let rarity, styling;
		const itemPercent = ((i + 1) / TOTAL_ITEMS) * 100;
		if (itemPercent <= 50) {
			rarity = 'Common';
			styling = 'text-gray-500 bg-gray-500/30 border-gray-500 '
		} else if (itemPercent <= 80) {
			rarity = 'Uncommon';
			styling = 'text-blue-500 bg-blue-500/30 border-blue-500 '			
		} else if (itemPercent <= 95) {
			rarity = 'Rare';
			styling = 'text-purple-500 bg-purple-500/30 border-purple-500 '
		} else {
			rarity = 'Legendary';
			styling = 'text-amber-500 bg-amber-500/30 border-amber-500 '
		}
		return {
			id: i + 1,
			name: `Item ${i + 1}`,
			rarity,
			styling,
			amount: 1
  	}
	});
  
  // Load collection from localStorage on initial render
  useEffect(() => {
    const savedCollection = localStorage.getItem('lotteryCollection');
    if (savedCollection) {
      setCollection(JSON.parse(savedCollection));
    }
  }, []);
  
  // Save collection to localStorage whenever it changes
  useEffect(() => {
    // Calculate repeat rate based on collection
    if (collection.length > 0) {
			localStorage.setItem('lotteryCollection', JSON.stringify(collection));
      const baseRepeatRate = collection.length * REPEAT_INCREASE;
      const coinDiscount = (coins - 1) * REPEAT_INCREASE;
      setRepeatRate(Math.max(0, baseRepeatRate - coinDiscount));
    } else {
      setRepeatRate(0);
    }
  }, [collection]);

	useEffect(() => {
      const coinDiscount = (coins - 1) * REPEAT_INCREASE;
			const baseRepeatRate = collection.length * REPEAT_INCREASE;
      setRepeatRate(Math.max(0, baseRepeatRate - coinDiscount));
  }, [coins]);
  
  // Handle spin button click
  const handleSpin = () => {
    if (isSpinning) return;
    
    setIsSpinning(true);
    
    // Simulate spinning animation
    setTimeout(() => {
      // Get all unique item IDs in collection
      const collectedIds = collection.map(item => item.id);
         
      // Roll for item. Cause random selection from array sucks.
      const isRepeat = Math.random() * 100 < repeatRate;
      let winItem;
      
      if (isRepeat && collectedIds.length > 0) {
        // Pick a random item from already collected items
        const randomIndex = Math.floor(Math.random() * collectedIds.length);
        winItem = items.find(item => item.id === collectedIds[randomIndex]);
      } else {
        // Pick a random item from items not in collection
        const availableItems = items.filter(item => !collectedIds.includes(item.id));
        
        // If all items collected, pick any random item
        const itemPool = availableItems.length > 0 ? availableItems : items;
        const randomIndex = Math.floor(Math.random() * itemPool.length);
        winItem = itemPool[randomIndex];
      }
      
      // Add the item to collection if not already there
      if (!collectedIds.includes(winItem.id)) {
        setCollection(prev => [...prev, winItem]);
      } else {
				setCollection(prev => 
					prev.map(item=>
						item.id === winItem.id ? {...item, amount: item.amount + 1} : item
					)
				);
			}
      
      // Set last win
      setLastWin(winItem);
      
      // Reset coins
      setIsSpinning(false);
    }, 1500);
  };
  
  // Reset collection
  const resetCollection = () => {
    if (window.confirm('Are you sure you want to reset your collection?')) {
      setCollection([]);
      setLastWin(null);
      localStorage.removeItem('lotteryCollection');
    }
  };
  
  return (
    <div className="flex flex-col items-center justify-center p-4 max-w-md mx-auto bg-gray-100 rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-4">Lottery Machine</h1>
      
      {/* Machine display */}
      <div className="bg-white p-4 rounded-lg shadow-inner w-full mb-4 flex flex-col items-center">
        <div className="text-lg mb-2">Collection: <span className="font-bold">{collection.length}/{TOTAL_ITEMS}</span></div>
        <div className="text-lg mb-2">Repeat Rate: <span className="font-bold">{repeatRate.toFixed(2)}%</span></div>
        <div className="text-lg mb-4">Coins: <span className="font-bold">{coins}</span></div>
        
        {/* Results display */}
        <div className="h-24 w-full flex items-center justify-center border-2 border-gray-300 rounded mb-4">
          {isSpinning ? (
            <div className="animate-spin h-12 w-12 border-4 border-blue-500 rounded-full border-t-transparent"></div>
          ) : lastWin ? (
            <div className={`text-xl font-bold ${lastWin.color}`}>
              {lastWin.name} - {lastWin.rarity}
            </div>
          ) : (
            <div className="text-gray-400">Spin to win an item!</div>
          )}
        </div>
      </div>
      
      {/* Controls */}
      <div className="flex w-full mb-4">
        <div className="mr-2 flex-grow">
          <label className="block text-sm font-medium mb-1">Coins to Insert</label>
          <input
            type="number"
            min="1"
            max={TOTAL_ITEMS}
            value={coins}
						onChange={(e) => setCoins(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full p-2 border border-gray-300 rounded"
            disabled={isSpinning}
          />
        </div>
        <div className="flex-grow">
          <label className="block text-sm font-medium mb-1">Actions</label>
          <div className="flex">
            <button
              onClick={handleSpin}
              className={`flex-1 p-2 rounded text-white transition ${isSpinning ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'}`}
              disabled={isSpinning}
            >
              Spin
            </button>
          </div>
        </div>
      </div>
      
      {/* Collection */}
      <div className="w-full">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold">Your Collection</h2>
          <button
            onClick={resetCollection}
            className="text-sm text-red-500 hover:text-red-700"
            disabled={isSpinning}
          >
            Reset
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-5 bg-white rounded shadow-inner max-h-64 overflow-y-auto">
          {collection.length > 0 ? (
            collection.map((item) => (
              <div
                key={item.id}
                className={`relative p-2 rounded border ${item.styling}`}
              >
                <div className={`font-medium`}>{item.name}</div>
                <div className="text-xs">{item.rarity}</div>
								{item.amount > 1 ? <span className="absolute top-0 end-0 inline-flex items-center py-0.5 px-1.5 rounded-full text-xs font-medium transform -translate-y-1/2 translate-x-1/2 bg-red-500 text-white border-white border-3">{item.amount}</span> : "" }
              </div>
            ))
          ) : (
            <div className="col-span-full text-center text-gray-400 py-8">
              No items collected yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LotteryMachine;